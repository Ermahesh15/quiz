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


const initialState = {
  questions: [],
  //loading, error, ready, active, finished
  status: 'loading',
  index: 0,
  answer: null,
  points: 0
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

    case 'restart':
      return initialState;
    default:
      throw new Error('unknown action');
  }
}

function App() {
  const [{ questions, status, index, answer, points }, dispatch] = useReducer(reducer, initialState);
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
            //highscore={highscore} 
            dispatch={dispatch}
          />
        }

      </Main>
    </div>
  );
}

export default App;
