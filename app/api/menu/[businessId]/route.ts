import { NextRequest, NextResponse } from 'next/server';
import { getMenuForBusiness } from '@/lib/menu';
import handleError from '@/lib/handlers/errors';

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/menu/[businessId]'>
) {
  try {
    const { businessId } = await ctx.params;
    const menu = await getMenuForBusiness(businessId);
    return NextResponse.json(menu);
  } catch (error) {
    return handleError(error) as NextResponse;
  }
}
