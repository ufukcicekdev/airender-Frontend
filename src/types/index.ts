export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
  is_verified: boolean;
  credits: number;
}

export interface PricingSettings {
  plans_section_title: string;
  plans_section_description: string;
  monthly_toggle_label: string;
  monthly_description: string;
  yearly_toggle_label: string;
  yearly_description: string;
  yearly_discount_note: string;
  credits_section_title: string;
  credits_section_description: string;
  credits_footer_note: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  monthly_description: string;
  yearly_description: string;
  currency: string;
  credits_monthly: number;
  features: string[];
  is_popular: boolean;
}

export interface CreditPack {
  id: string;
  slug: string;
  name: string;
  description: string;
  credits: number;
  bonus_credits: number;
  total_credits: number;
  price: string;
  currency: string;
  features: string[];
  is_popular: boolean;
}

export interface PricingOverview {
  settings: PricingSettings;
  plans: Plan[];
  credit_packs: CreditPack[];
}

export interface UserSubscription {
  id: string;
  plan: Plan;
  status: "active" | "cancelled" | "trialing";
  billing_cycle: "monthly" | "yearly";
  started_at: string;
  current_period_end: string | null;
}

export interface ModelPromptPreset {
  id: string;
  slug: string;
  title: string;
  icon: string;
  positive_prompt: string;
  negative_prompt: string;
  is_default: boolean;
}

export interface UserPromptPreset {
  id: string;
  title: string;
  icon: string;
  positive_prompt: string;
  negative_prompt: string;
  category_slug_display: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserPromptPresetInput {
  title: string;
  icon?: string;
  positive_prompt: string;
  negative_prompt?: string;
  category_slug: string;
  sort_order?: number;
}

export interface ModelInputImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  name?: string;
  /** Inpaint / edit mask (white = region to edit). */
  maskUrl?: string;
}

export type ModelTag = "free" | "pro" | "new" | "beta" | "";

export interface CatalogModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  tag?: ModelTag | string;
  brand_icon?: string;
  provider: string;
  external_id: string;
  credit_cost: number;
  requires_images: boolean;
  min_input_images: number;
  max_input_images: number;
  input_images_label: string;
  input_images_help: string;
  config: Record<string, unknown>;
  default_positive: string;
  default_negative: string;
}

export interface CapabilityCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  prompt_presets: ModelPromptPreset[];
  models: CatalogModel[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string | null;
  is_template: boolean;
  workflow_id?: string | null;
  preview_url?: string | null;
  node_count?: number;
  last_activity_label?: string;
  last_activity_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowGraph {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  project_id: string;
  name: string;
  graph: WorkflowGraph;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url: string | null;
  width: number;
  height: number;
  file_size: number;
  created_at: string;
}

export type RenderStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface RenderTask {
  id: string;
  workflow: string;
  status: RenderStatus;
  progress: number;
  current_stage: string;
  node_statuses: Record<string, string>;
  error_message: string;
  images: GeneratedImage[];
  flow_data?: WorkflowGraph;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface GeneratedImage {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  width: number;
  height: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NodeType =
  | "source"
  | "merge"
  | "prompt"
  | "render"
  | "detail"
  | "lighting"
  | "upscale"
  | "output"
  | "text_prompt"
  | "ai_model"
  | "image_output";

export type { FlowData, FlowGraphEdge, FlowGraphNode, FlowNodeType } from "./flow-graph";

export interface NodeData {
  label: string;
  status?: "idle" | "queued" | "processing" | "completed" | "error";
  progress?: number;
  error?: string;
  [key: string]: unknown;
}
