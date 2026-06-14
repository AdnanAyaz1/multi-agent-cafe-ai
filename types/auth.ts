export interface LoginFormProps {
  callbackUrl?: string;
}

export interface LoginSearchParamsProps {
  checkoutPlan?: string;
}

export interface LoginPageProps {
  searchParams: Promise<{ checkout?: string }>;
}
