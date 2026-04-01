import anthropic from '../config/claude';
import db from '../config/database';

interface ChatParams {
  projectId: string;
  message: string;
  context: 'cost_analysis' | 'valuation' | 'projections' | 'general';
  language: 'en' | 'es';
}

interface Suggestion {
  type: 'cost_item' | 'valuation' | 'projection' | 'info';
  label: string;
  data: Record<string, unknown>;
}

export async function chat(params: ChatParams): Promise<{ reply: string; suggestions: Suggestion[] }> {
  const { projectId, message, context, language } = params;

  // Load project data
  const project = await db('projects').where('id', projectId).first();
  const costItems = await db('cost_items').where('project_id', projectId);
  const valuations = await db('valuations').where('project_id', projectId);
  const projections = await db('projections').where('project_id', projectId);

  // Load or create conversation
  let conversation = await db('conversations')
    .where({ project_id: projectId, context })
    .first();

  if (!conversation) {
    [conversation] = await db('conversations').insert({
      project_id: projectId,
      context,
      messages: JSON.stringify([]),
    }).returning('*');
  }

  const messages: { role: string; content: string }[] = conversation.messages || [];

  // Build system prompt
  const totalCostMxn = costItems.reduce((sum: number, item: any) => sum + parseFloat(item.amount_mxn || 0), 0);
  const systemPrompt = buildSystemPrompt(project, totalCostMxn, costItems, valuations, projections, context, language);

  // Add user message
  messages.push({ role: 'user', content: message });

  // Keep last 20 messages to control token usage
  const recentMessages = messages.slice(-20);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: systemPrompt,
    messages: recentMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const replyText = response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') return block.text;
      return '';
    })
    .join('');

  // Parse suggestions from response
  const suggestions = parseSuggestions(replyText);

  // Save conversation
  const updatedMessages = [...recentMessages, { role: 'assistant', content: replyText }];
  await db('conversations')
    .where('id', conversation.id)
    .update({
      messages: JSON.stringify(updatedMessages),
      updated_at: new Date(),
    });

  return { reply: replyText, suggestions };
}

export async function getHistory(projectId: string, context: string) {
  const conversation = await db('conversations')
    .where({ project_id: projectId, context })
    .first();
  return conversation?.messages || [];
}

function buildSystemPrompt(
  project: any,
  totalCostMxn: number,
  costItems: any[],
  valuations: any[],
  projections: any[],
  context: string,
  language: string,
): string {
  const lang = language === 'es' ? 'Spanish' : 'English';

  let prompt = `You are an expert real estate underwriting assistant specializing in Mexican development projects. You help users analyze costs, value properties, and create financial projections.

Respond in ${lang}. Be specific to Mexican markets. When suggesting values, always give ranges in MXN. Flag any red flags or unusual values.

When you want to suggest structured data (like a cost item to add), include it in a JSON code block marked with \`\`\`suggestion
{
  "type": "cost_item",
  "label": "Description of the suggestion",
  "data": { "category": "...", "amount_mxn": ... }
}
\`\`\`
This allows the app to offer auto-populate buttons to the user.`;

  if (project) {
    prompt += `\n\nCurrent project:
- Name: ${project.name}
- Type: ${project.project_type}
- Location: ${project.location}
- Status: ${project.status}
- Exchange rate: ${project.exchange_rate} MXN/USD
- Total costs so far: $${totalCostMxn.toLocaleString()} MXN`;

    if (costItems.length > 0) {
      prompt += `\n\nCost breakdown:`;
      const categories = new Map<string, number>();
      for (const item of costItems) {
        const cat = item.category;
        categories.set(cat, (categories.get(cat) || 0) + parseFloat(item.amount_mxn));
      }
      for (const [cat, total] of categories) {
        prompt += `\n- ${cat}: $${total.toLocaleString()} MXN`;
      }
    }

    if (valuations.length > 0) {
      prompt += `\n\nValuations:`;
      for (const v of valuations) {
        prompt += `\n- ${v.method}: $${parseFloat(v.estimated_value_mxn || 0).toLocaleString()} MXN`;
      }
    }

    if (projections.length > 0) {
      prompt += `\n\nProjections:`;
      for (const p of projections) {
        prompt += `\n- ${p.name}: ROI=${p.roi ? (p.roi * 100).toFixed(1) + '%' : 'not calculated'}, IRR=${p.irr ? (p.irr * 100).toFixed(1) + '%' : 'not calculated'}`;
      }
    }
  }

  // Context-specific guidance
  switch (context) {
    case 'cost_analysis':
      prompt += `\n\nYou are currently helping with cost analysis. Help the user identify and estimate all development costs. Consider typical Mexican costs:
- Land acquisition (including notary fees ~5-8%, ISAI ~2-5%)
- Construction costs per m² by region
- Permits (Licencia de Construccion, Uso de Suelo, Impacto Ambiental)
- Professional fees (architect, engineer, legal)
- Financing costs (bank rates in Mexico ~10-14% annual)
- Taxes (IVA 16% on construction, ISR, predial)`;
      break;
    case 'valuation':
      prompt += `\n\nYou are currently helping with property valuation. Guide the user through:
- Comparable sales analysis for the Mexican market
- Cap rate estimation (residential 5-8%, commercial 7-10%, mixed-use 6-9%)
- Income approach for rental properties
- Consider location-specific factors in Mexico`;
      break;
    case 'projections':
      prompt += `\n\nYou are currently helping with financial projections. Help analyze:
- Monthly cash flow projections
- ROI and IRR calculations
- Sensitivity analysis (what-if scenarios)
- Risk factors specific to Mexican real estate (exchange rate, inflation, permitting delays)`;
      break;
  }

  return prompt;
}

function parseSuggestions(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const regex = /```suggestion\s*\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.type && parsed.label) {
        suggestions.push(parsed);
      }
    } catch {
      // Skip malformed suggestions
    }
  }

  return suggestions;
}
