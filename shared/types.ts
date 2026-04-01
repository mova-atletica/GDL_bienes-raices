// ---- Enums ----

export type ProjectType = 'residential' | 'commercial' | 'mixed_use' | 'agricultural';
export type ProjectStatus = 'draft' | 'in_progress' | 'complete';
export type CostCategory = 'land' | 'construction' | 'permits' | 'fees' | 'financing' | 'taxes' | 'other';
export type ValuationMethod = 'comparable_sales' | 'cap_rate' | 'income';
export type AssistantContext = 'cost_analysis' | 'valuation' | 'projections' | 'general';

// ---- Database Models ----

export interface Project {
  id: string;
  name: string;
  project_type: ProjectType;
  template_id: string | null;
  location: string;
  description: string;
  status: ProjectStatus;
  currency: string;
  exchange_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CostItem {
  id: string;
  project_id: string;
  category: CostCategory;
  subcategory: string;
  description: string;
  amount_mxn: number;
  amount_usd: number;
  is_recurring: boolean;
  recurrence_months: number | null;
  notes: string;
  sort_order: number;
  created_at: string;
}

export interface Valuation {
  id: string;
  project_id: string;
  method: ValuationMethod;
  estimated_value_mxn: number;
  estimated_value_usd: number;
  cap_rate: number | null;
  noi_annual_mxn: number | null;
  data: Record<string, unknown>;
  notes: string;
  created_at: string;
}

export interface Projection {
  id: string;
  project_id: string;
  name: string;
  projection_months: number;
  monthly_revenue_mxn: number;
  monthly_expenses_mxn: number;
  sale_price_mxn: number;
  sale_month: number | null;
  discount_rate: number;
  roi: number | null;
  irr: number | null;
  cash_flows: number[];
  sensitivity: SensitivityResult | null;
  created_at: string;
}

export interface Template {
  id: string;
  name_en: string;
  name_es: string;
  project_type: ProjectType;
  description_en: string;
  description_es: string;
  default_costs: DefaultCostEntry[];
  default_assumptions: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  messages: ChatMessage[];
  context: AssistantContext;
  created_at: string;
  updated_at: string;
}

// ---- Supporting Types ----

export interface DefaultCostEntry {
  category: CostCategory;
  subcategory: string;
  description_en: string;
  description_es: string;
  typical_pct: number | null;
  typical_range_mxn: [number, number] | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SensitivityResult {
  variable_x: string;
  variable_y: string;
  x_values: number[];
  y_values: number[];
  irr_matrix: number[][];
  roi_matrix: number[][];
}

export interface CostSummary {
  by_category: { category: CostCategory; total_mxn: number; total_usd: number; percentage: number }[];
  total_mxn: number;
  total_usd: number;
}

// ---- API Request/Response Types ----

export interface CreateProjectRequest {
  name: string;
  project_type: ProjectType;
  template_id?: string;
  location: string;
  description?: string;
  exchange_rate?: number;
}

export interface CreateCostItemRequest {
  category: CostCategory;
  subcategory?: string;
  description?: string;
  amount_mxn: number;
  is_recurring?: boolean;
  recurrence_months?: number;
  notes?: string;
}

export interface CreateValuationRequest {
  method: ValuationMethod;
  estimated_value_mxn?: number;
  cap_rate?: number;
  noi_annual_mxn?: number;
  data?: Record<string, unknown>;
  notes?: string;
}

export interface CreateProjectionRequest {
  name: string;
  projection_months: number;
  monthly_revenue_mxn: number;
  monthly_expenses_mxn: number;
  sale_price_mxn: number;
  sale_month?: number;
  discount_rate: number;
}

export interface AssistantChatRequest {
  message: string;
  context: AssistantContext;
  language: 'en' | 'es';
}

export interface AssistantChatResponse {
  reply: string;
  suggestions?: AssistantSuggestion[];
}

export interface AssistantSuggestion {
  type: 'cost_item' | 'valuation' | 'projection' | 'info';
  label: string;
  data: Record<string, unknown>;
}
