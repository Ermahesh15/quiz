import { useEffect, useReducer } from "react";
import Header from "./Header";
import "../Assets/index.css"
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import Footer from "./Footer";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Timer from "./Timer";


const initialState = {
  questions: [],
  //loading, error, ready, active, finished
  status: 'loading',
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: 12
}

function reducer(state, action) {
  switch (action.type) {
    case 'dataRecieved':
      return { ...state, questions: action.payload, status: 'ready' };
    case 'loading':
      return { ...state, status: 'loading' };
    case 'dataFailed':
      return { ...state, status: 'error' };
    case 'start':
      return { ...state, status: 'active' };
    case 'nextQuestion':
      return { ...state, index: state.index + 1, answer: null };
    case 'newAnswer':
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points
      };

    case 'finish':
      return {
        ...state,
        status: 'finished',
        highscore: state.highscore < state.points ? state.points : state.highscore
      };
    case 'restart':
      return {
        ...initialState,
        questions: state.questions,
        status: 'ready',
        highscore: state.highscore
      }

    case 'tick':
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? 'finished' : state.status,

      }

    default:
      throw new Error('unknown action');
  }
}

function App() {
  const [{ questions, status, index, answer, points, highscore, secondsRemaining }, dispatch] = useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const maxPossiblePoints = questions.reduce((prev, curr) => prev + curr.points, 0)

  useEffect(function () {
    async function getData() {
      try {
        const res = await fetch('http://localhost:9000/questions');
        const json = await res.json();
        dispatch({ type: 'dataRecieved', payload: json })
      } catch (err) {
        dispatch({ type: 'dataFailed' })
      }
    }

    getData()
  }, [])
  return (
    <div className="app">
      <Header />
      <Main>
        {status === 'loading' && <Loader />}
        {status === 'error' && <Error />}
        {status === 'ready' && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}

        {status === 'active' &&
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              answer={answer}
              maxPossiblePoints={maxPossiblePoints}
            />
            <Question
              dispatch={dispatch}
              question={questions[index]}
              answer={answer} />
            <Footer>
              <Timer
                dispatch={dispatch}
                secondsRemaining={secondsRemaining}
              />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                numQuestions={numQuestions}
                index={index}
              />
            </Footer>
          </>
        }

        {status === 'finished' &&
          <FinishScreen
            points={points}
            maxPossiblePoints={maxPossiblePoints}
            dispatch={dispatch}
            highscore={highscore}
          />
        }

      </Main>
    </div>
  );
}

export default App;
