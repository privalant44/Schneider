import { NextResponse } from 'next/server';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '@/lib/json-database';

export async function GET() {
  try {
    const questions = getQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      question_text, 
      text_a, text_b, text_c, text_d,
      image_a, image_b, image_c, image_d, 
      order_index 
    } = await request.json();
    
    const newQuestion = addQuestion({
      question_text,
      text_a,
      text_b,
      text_c,
      text_d,
      image_a,
      image_b,
      image_c,
      image_d,
      order_index
    });

    return NextResponse.json({ id: newQuestion.id });
  } catch (error) {
    console.error('Erreur lors de la création de la question:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { 
      id, 
      question_text, 
      text_a, text_b, text_c, text_d,
      image_a, image_b, image_c, image_d, 
      order_index 
    } = await request.json();
    
    const updatedQuestion = updateQuestion(id, {
      question_text,
      text_a,
      text_b,
      text_c,
      text_d,
      image_a,
      image_b,
      image_c,
      image_d,
      order_index
    });

    if (updatedQuestion) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la question:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de question requis' },
        { status: 400 }
      );
    }

    const success = deleteQuestion(id);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Question non trouvée' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la question' },
      { status: 500 }
    );
  }
}
