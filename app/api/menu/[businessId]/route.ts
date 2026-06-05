import { NextRequest, NextResponse } from 'next/server';
import { getMenuForBusiness } from '@/lib/menu';
import { withApiHandler } from '@/lib/api/handler';

export const GET = withApiHandler(
  async (
    _request: NextRequest,
    ctx: RouteContext<'/api/menu/[businessId]'>
  ) => {
    const { businessId } = await ctx.params;
    const menu = await getMenuForBusiness(businessId);
    return NextResponse.json(menu);
  }
);
