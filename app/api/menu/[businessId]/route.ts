import { NextResponse } from 'next/server';
import { getMenuForBusiness } from '@/lib/menu';
import { apiHandler } from '@/lib/api/handler';

export const GET = apiHandler(async (_request, ctx) => {
  const { businessId } = await ctx.params;
  const menu = await getMenuForBusiness(businessId);
  return NextResponse.json(menu);
});
