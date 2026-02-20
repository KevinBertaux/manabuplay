export function generateQuestion(tableSelect = 'all', randomFn = Math.random) {
  let num1;
  let num2;

  if (tableSelect === 'all') {
    num1 = Math.floor(randomFn() * 12);
    num2 = Math.floor(randomFn() * 12);
  } else {
    num1 = Number.parseInt(tableSelect, 10);
    num2 = Math.floor(randomFn() * 12);
  }

  return {
    num1,
    num2,
    answer: num1 * num2,
  };
}

export function evaluateAnswer({ answerInput, question, score, total, streak }) {
  const parsed = Number.parseInt(answerInput, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return {
      isValid: false,
      feedbackType: 'incorrect',
      feedbackMain: '⚠️ Entre un nombre positif !',
      feedbackExtra: '',
      nextScore: score,
      nextTotal: total,
      nextStreak: streak,
    };
  }

  const nextTotal = total + 1;
  if (parsed === question.answer) {
    const nextScore = score + 1;
    const nextStreak = streak + 1;
    return {
      isValid: true,
      feedbackType: 'correct',
      feedbackMain: `🎉 Bravo ! ${question.num1} × ${question.num2} = ${question.answer}`,
      feedbackExtra: nextStreak >= 5 ? `🔥 Série de ${nextStreak} ! Continue comme ça !` : '',
      nextScore,
      nextTotal,
      nextStreak,
    };
  }

  return {
    isValid: true,
    feedbackType: 'incorrect',
    feedbackMain: `❌ Pas tout à fait... La bonne réponse est ${question.answer}`,
    feedbackExtra: '',
    nextScore: score,
    nextTotal,
    nextStreak: 0,
  };
}
