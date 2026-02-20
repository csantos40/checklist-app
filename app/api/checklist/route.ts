import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Puxa os dados para o Dashboard
export async function GET() {
  const total = await prisma.checklistItem.count();
  const conforme = await prisma.checklistItem.count({ where: { status: 'Conforme' } });
  const naoConforme = await prisma.checklistItem.count({ where: { status: 'Não Conforme' } });
  const pendente = await prisma.checklistItem.count({ where: { status: 'Pendente' } });

  return NextResponse.json({ total, conforme, naoConforme, pendente });
}

// Salva o checklist preenchido no Supabase
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { department, tasks } = data;

    const records = tasks.map((t: any) => ({
      department,
      description: t.description,
      periodicity: t.periodicity,
      status: t.status,
      observation: t.observation || "",
    }));

    await prisma.checklistItem.createMany({ data: records });

    return NextResponse.json({ success: true, message: 'Salvo com sucesso no banco!' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar os dados' }, { status: 500 });
  }
}