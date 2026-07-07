import { NextRequest, NextResponse } from 'next/server';
import { getMenuForBusiness } from '@/lib/menu';
import { withErrorHandling } from '@/lib/api/with-error-handling';

export const GET = withErrorHandling(async (
  _request: NextRequest,
  ctx: RouteContext<'/api/menu/[businessId]'>
) => {
  const { businessId } = await ctx.params;
  const menu = await getMenuForBusiness(businessId);
  return NextResponse.json(menu);
});
