import './App.css';
import React, { Fragment, useEffect, useState } from "react";
import Speech from "speak-tts" // es6

function App() {
  const [listItem,setListItem] = useState([]);
  const speech = new Speech();
  speech.init({
      'volume': 1,
      'lang': 'en-GB',
      'rate': 1,
      'pitch': 1,
      'voice':'Google UK English Female',
      'splitSentences': true,
      'listeners': {
          'onvoiceschanged': (voices) => {
              console.log("Event voiceschanged", voices)
          }
      }
  })
  useEffect(()=>{   
    fetch("https://elegant-moment-284814-default-rtdb.firebaseio.com/e.json", {method: "GET"}).
    then(res => res.json())
    .then(
        (result) => {
                //console.log("result: ",result);
                
                setListItem(result.map((x) => {
                    const words = x.content.split(' ');
                    let element = words.map(y => {
                      return(
                        <span onClick={() => {speech.speak({text: y,})}}>{y} </span>
                      )
                    })
                    return(
                          <div>
                              {element}
                              <br/>
                              <br/>
                          </div>
                    )
            }))
        }
    )
  },[]);
  return (
    <div className="App">
      {listItem}
    </div>
  );
}

export default App;
