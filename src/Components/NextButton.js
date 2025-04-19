export default function NextButton({ dispatch, answer, index, numQuestions }) {
    if (answer === null) return null;
  
    return (
      <button
        className="btn btn-ui"
        onClick={() =>
          dispatch({ type: index < numQuestions - 1 ? "nextQuestion" : "finish" })
        }
      >
        {index < numQuestions - 1 ? "Next" : "Finish"}
      </button>
    );
  }
  