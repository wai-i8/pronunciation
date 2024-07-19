import './App.scss';
import ToTopButton from "./ToTopButton";
import Confirm from "./Confirm";
import React, { useEffect, useState, useRef } from "react";
import Speech from "speak-tts" // es6

function App() {
  const [listItem,setListItem] = useState([]);
  
  const [target,setTarget] = useState("");
  const [explication,setExplication] = useState("");
  const [example,setExample] = useState("");
  const [inputError,setInputError] = useState(false);
  const [searchWord,setSearchWord] = useState("");

  const [update,setUpdate] = useState(false);
  const [isModify,setIsModify] = useState(false);
  const [modifyIndex,setModifyIndex] = useState("");
  const [modifyTarget,setModifyTarget] = useState("");
  const [modifyExplication,setModifyExplication] = useState("");
  const [modifyExample,setModifyExample] = useState("");
  const [modifyError,setModifyError] = useState(false);
  const [playing,setPlaying] = useState(false);
  const [playListPaused,setPlayListPaused] = useState(false);

  const [hidden,setHidden] = useState(false);
  const [showCommon,setShowCommon] = useState(true);
  const [dbresult,setDbresult] = useState();
  const shuffleNum = useRef([]);
  const isHandleshuffle = useRef(false);
  const entryNo = useRef(0);
  const todayEntryNo = useRef(0);
  const dayBang = useRef(false);
  const highlightedNo = useRef(0);
  const highlightIndex = useRef(0);
  const highlightContent = useRef(0);
  const playList = useRef([]);
  const playingList = useRef([]);
  const playingListRecursive = useRef([]);
  const playListLast = useRef("");

  const pageLimit = 20;
  const volIndex = useRef(0);
  const volNo = useRef(0);
  const [processedItems, setProcessedItems] = useState([]);
  const dbUpdated = useRef(0);
  const preIndex = useRef(0);
  
  let darkmodeStyle = {backgroundColor: "black", color: "#CCC"};
  let nonDarkmodeStyle = {backgroundColor: "white", color: "black"};
  const [appStyle,setAppStyle] = useState(darkmodeStyle);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [pageNo, setPageNo] = useState(1);


  const speech = new Speech();

  speech.init({ 
    'volume': window.innerWidth <= 600? 1: 0.5,
      'lang': 'en-GB',
      'rate': 1,
      'pitch': 1,
      'voice':'Google UK English Female',
      'splitSentences': true,
      'listeners': {
          'onvoiceschanged': (voices) => {
              //console.log("Event voiceschanged", voices)
          }
      }
  })

  const speechHK = new Speech();

  speechHK.init({ 
    'volume': window.innerWidth <= 600? 0.6: 1,
      'lang': 'zh-HK',
      'rate': 1,
      'pitch': 1,
      'splitSentences': true,
      'listeners': {
          'onvoiceschanged': (voices) => {
              //console.log("Event voiceschanged", voices)
          }
      }
  })
  
  const popModifyHandler = (index,content) => {
    setModifyIndex(index+ "/content");
    if (content.indexOf(" --- ") !== -1){
      let words = content.split(" --- ");
      setModifyTarget(words[0]);
      if (content.indexOf(" (") !== -1){
        words = words[1].split(" (");
        if(words.length === 1){
          words = words[0].split(")");
          setModifyExample(words[0].slice(1));
        }else{        
          setModifyExplication(words[0]);
          words = words[1].split(")");
          setModifyExample(words[0]);
        }
      }else{
        setModifyExplication(words[1]);
      }
    }else{
      setModifyTarget(content);
    }
    setIsModify(true);
    console.log("modifyTarget: ", isModify);
  }

  const highlightHandler = (index,content) => {
    console.log(highlightContent.current);
    setModifyIndex(index+ "/content");
    let words = content.split(" --- ");
    let updatewords;
    if (words[0].substring(words[0].length - 1) !== "*"){
      updatewords = words[0] + "*" + " --- " + words[1];
    }else{
      updatewords = words[0].slice(0, words[0].length-1) + " --- " + words[1];
    }
    
    let body = {[index+ "/content"] : updatewords};
    //console.log("body: ", body);
    fetch("https://elegant-moment-284814-default-rtdb.firebaseio.com/e.json", {method: "PATCH", 
    body: JSON.stringify(body)});
    if (shuffleNum.current.length === 0 && !hidden){
      console.log("1 sec")
      setTimeout(() => {dbUpdated.current = 0;setUpdate(update? false : true)},1000);
    }
  }

  const listItemHandler = () => {
    console.log("listItemHandler")
    if (dbresult == null){
      //console.log("return" + hidden)
      return;
      
    }
    console.log("listItemHandler dbresult !== null")
    volNo.current = 0
    //console.log("not return " + hidden)
    highlightedNo.current = 0;
    entryNo.current = 0;
    dayBang.current = false;
    todayEntryNo.current = 0;
    playList.current.length = 0;
    setListItem(Object.keys(dbresult).slice(0).reverse().map((x,index) => { 
      //console.log("x: ", result[x].content);
      let words=[];
      let speaking;
      let element;
      if (dbresult[x].content.toUpperCase().indexOf(searchWord.toUpperCase()) === -1 || dbresult[x].content.toUpperCase().indexOf(target.toUpperCase()) === -1) {
        return;
      }
      speaking = dbresult[x].content.split(" --- ")[0];
      entryNo.current = speaking.substring(0,4) === "Day " ? entryNo.current : entryNo.current + 1;
      dayBang.current = speaking.substring(0,4) === "Day " ? true : dayBang.current;
      todayEntryNo.current = dayBang.current ? todayEntryNo.current : todayEntryNo.current + 1; 
      if (dbresult[x].content.search(" --- ") !== -1){
        words.push(speaking);
        words.push(" --- ");
        let  word = dbresult[x].content.split(" --- ")[1].split(' ');
        word.map(z => words.push(z));
      }else{
        words = dbresult[x].content.split(' ');
      }
      let highlightWord = speaking.substring(speaking.length - 1) === "*" ? true : false;
      highlightedNo.current = highlightWord ? highlightedNo.current + 1 : highlightedNo.current;
      element = words.map((y, index) => {
        let highlightStyle = index === 0 && highlightWord ? {backgroundColor : "yellow", color : "black"} : {};
        if(index === 0 || y[0]>"z"){
          playList.current.push(y);
        }
        return(
          <span style={highlightStyle} key={Math.random()} onClick={() => 
            {y[0]>"z" ? speechHK.speak({text: y,}) : speech.speak({text: y,})}}>{y} </span>
        )
      })

      return(
            <div key={Math.random()} className="App_listitem" style={showCommon || highlightWord ? {display : "block"} : {display : "none"}}>
              <div id={"h"+index} className="App_listitem_hidden" style={hidden? {display : "block"} : {display : "none"}}>
                <i id={"m"+index} className="fa-solid fa-magnifying-glass" onClick={() => 
                {document.getElementById("e"+index).style={display : "block"};
                document.getElementById("h"+index).style={display : "none"};}}></i>
                <i className="fa-solid fa-headphones" onClick={() => {speech.speak({text: speaking,})}}></i>
              </div>
              <div id={"e"+index} style={hidden? {display : "none"} : {display : "block"}}>
                {element} <i onClick={() => popModifyHandler(Object.keys(dbresult)[Object.keys(dbresult).length-1-index],dbresult[x].content)} 
                className="fa-solid fa-pencil"></i> 
                <i onClick={()=> {highlightIndex.current = Object.keys(dbresult)[Object.keys(dbresult).length-1-index]; 
                                  highlightContent.current = dbresult[x].content; setShowConfirm(true);console.log(highlightContent.current);}} className="fa-solid fa-highlighter"></i>
              </div>
                <br/>
            </div>
      )
    }))
  }

  const playAll = () => {
    if (explication !== "" && playingListRecursive.current.length === 0){
      //console.log(playingList.current);
      let skipCounter = example;
      if(skipCounter > 0){
        playingList.current = playingList.current.slice(example*2);
      }
      if(showCommon){
        playingList.current = playingList.current.slice(0,explication*2);
        playingListRecursive.current = playingList.current.slice(0);
      }else{
        let counter = 0;
        while (playingList.current.length > 0 && counter < explication){
          if (playingList.current[0][playingList.current[0].length-1]==="*"){
            playingListRecursive.current.push(playingList.current[0]);
            playingListRecursive.current.push(playingList.current[1]);
            counter = counter +1;
          }
          playingList.current = playingList.current.slice(1);
        }
        playingList.current = playingListRecursive.current;
      }
      setExplication("");
      setExample("");
    }

    if (!speech.speaking()){
      while(!showCommon && playListLast.current[playListLast.current.length-1]!=="*"){
        playListLast.current = playingList.current[0];
        playingList.current = playingList.current.slice(1);
      }
      if ((playingList.current[0][0]>"z" && showCommon) || (playingList.current[0][0]>"z" && playListLast.current[playListLast.current.length-1]==="*")){
        setSearchWord(playListLast.current + " ---");
        //console.log(playListLast.current);
        for (let i = 0; i < 3; i++) {
          speech.speak({text: playListLast.current,})
          speechHK.speak({text: playingList.current[0],})
        }
      }else{
        playListLast.current = playingList.current[0];
      }
      playingList.current = playingList.current.slice(1);
    }
    //console.log(playingList.current.length);
    if (playingList.current.length > 0){
      setPlaying(true);
      console.log("1 sec")
      setTimeout(() => {playAll()},1000);
    }else if (playingListRecursive.current.length !==0){
      playingList.current = playingListRecursive.current.slice(0);
      console.log("1 sec")
      setTimeout(() => {playAll()},1000);
    }else{
      setPlaying(false);
    }
  }


  useEffect(()=>{   
    console.log("update")
    if(dbUpdated.current === 0){
      dbUpdated.current = 1
      fetch("https://elegant-moment-284814-default-rtdb.firebaseio.com/e.json", {method: "GET"})
      .then(res => res.json())
      .then(
        (result) => {
                console.log("setDbresult(result)")
                console.log("dbUpdated.current: ", dbUpdated.current)
                
                setDbresult(result);
                //console.log("result: ",result);
                //console.log("result[Object.keys(result)[0]]: ", Object.keys(result).length);
                //console.log("Object.keys(myObj).length: ", Object.keys(result).length);
        }
      )
    }
  },[update]);

  const submitHandler = () => {
    if (!target) {
      setInputError(true);
      setTarget("");
      return;
    }
  
    const fullEx = `${explication.replace(/[，；]/g, ',').replace(/[\n]/g, ' ')} ${example && `(${example.replace(/[\n]/g, ' ').trim()})`}`.trim();
    const body = { content: fullEx ? `${target.trim()} --- ${fullEx}` : target.trim() };
  
    fetch("https://elegant-moment-284814-default-rtdb.firebaseio.com/e.json", { method: "POST", body: JSON.stringify(body) });
  
    setTarget("");
    setExplication("");
    setExample("");
    console.log("1 sec")
    setTimeout(() => {dbUpdated.current = 0;setUpdate(!update)}, 1000);
  };
  

  const modifyHandler = () => {
    if (modifyTarget === "") {
      setModifyError(true);
      return;
    }
  
    let fullEx = modifyExample ? ` (${modifyExample.trim()})` : "";
    let body
    if(modifyTarget.substring(0,4) == "Day "){
      body = {
        [modifyIndex]: `${modifyTarget}` 
      };
    }else{
      body = {
        [modifyIndex]: `${modifyTarget} --- ${modifyExplication.replace(/[，；]/g, ',').replace(/[\n]/g, ' ').trim()}${fullEx.replace(/[\n]/g, ' ')}` 
      };
    }

  
    fetch("https://elegant-moment-284814-default-rtdb.firebaseio.com/e.json", {
      method: "PATCH", 
      body: JSON.stringify(body)
    });
  
    setModifyTarget("");
    setModifyExplication("");
    setModifyExample("");
    setIsModify(false);
  
    if (!hidden && !shuffleNum.current.length) {
      console.log("1 sec")
      setTimeout(() => {dbUpdated.current = 0;setUpdate(!update)}, 1000);
    }
  }
  

  const handleKeyDown = (key,fun) => {
    if (key === "Enter") {
      // 👇 Get input value
      //console.log("key === 'Enter'")
      fun();
    }
    //console.log("key <> 'Enter'")
  };
   
  const shuffleHandler = () => {
    const arr = listItem.slice(0);
    
    // Undo previous shuffle if shuffleNum has any values
    shuffleNum.current.forEach((num, i) => [arr[i+1], arr[num]] = [arr[num], arr[i+1]]);
    shuffleNum.current.length = 0;
    
    // Shuffle arr using Fisher-Yates shuffle algorithm
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
      shuffleNum.current.push(j);
    }
    
    // Build new list using shuffled arr
    const playList2 = arr.map(component => {
      const text = component.props.children[1].props.children[0][0].props.children[0];
      const additionalText = component.props.children[1].props.children[0]
        .filter(child => child.props.children[0][0] > "z")
        .map(child => child.props.children[0]);
      return [text, ...additionalText];
    }).flat();
    
    playList.current = playList2
    setListItem(arr);
  }
  

  const sortbyAtoZ = () => {
    setListItem(listItem.slice().sort((a, b) => {
      return a.props.children[1].props.children[0][0].props.children[0].localeCompare(b.props.children[1].props.children[0][0].props.children[0]);
    }));
  }

  useEffect(() =>{
    console.log("useEffect target")
    if (target.length >= 3 || target[0]>"z"){
      console.log("useEffect target run if")
      listItemHandler();
    }
  },[target]);

useEffect(() =>{
  console.log("useEffect dbresult,hidden,showCommon,searchWord,pageNo")
  if (dbresult == null){
    return
  }
  else{
    listItemHandler();
  }
//},[dbresult]);
},[dbresult,hidden,showCommon,searchWord]);



useEffect(() =>{
 console.log("useEffect listItem")
 if (shuffleNum.current.length !== 0 && isHandleshuffle.current){
   console.log("useEffect listItem run if")
   let arr = listItem.slice(0);
   //console.log(arr[3].props.children[1].props.style);

   for (let i = arr.length - 1; i > 0; i--) {
     //console.log(shuffleNum.current[arr.length-i-1]);
     [arr[i], arr[shuffleNum.current[arr.length-i-1]]] = [arr[shuffleNum.current[arr.length-i-1]], arr[i]];
   }

   setListItem(arr);
   isHandleshuffle.current = false;
 }
 },[listItem]);


  useEffect(() =>{
    console.log("useEffect target")
    if (target === "\n"){
      console.log("useEffect target run if")
      setTarget("");
    }
  },[target]);

  useEffect(() =>{
    console.log("useEffect explication")
    if (explication === "\n"){
      console.log("useEffect explication run if")
      setExplication("");
    }
  },[explication]);

  useEffect(() =>{
    console.log("useEffect example")
    if (example === "\n"){
      console.log("useEffect example run if")
      setExample("");
    }
  },[example]);
  
  useEffect(() => {
    // Reset volNo for each new listItem
    volNo.current = 0
    volIndex.current = preIndex.current

    const itemsToDisplay = listItem.map((x,index) => {
      if(volIndex.current <= index &&  volNo.current < pageLimit){
        volIndex.current = index
        //console.log("log: ",index, " ",volIndex.current," ",volNo.current," ", x.props.children[1].props.children[0][0].props.children[0].slice(-1));
        if (showCommon || x.props.children[1].props.children[0][0].props.children[0].slice(-1)=="*")
          volNo.current =volNo.current + 1
        return x
      }
      else
        return 
    });

    setProcessedItems(itemsToDisplay);
  }, [listItem,pageNo]);

  return (
    <>
    <div className="App" style={appStyle}>
      <div className="App_header">
        <div className="App_header_no">
          <span>{highlightedNo.current}</span>
          <span>/</span>
          <span>{entryNo.current}</span>
          <span> - </span>
          <span>{todayEntryNo.current}</span>
        </div>
        <div className="App_header_setting">
          <i className="fa-solid fa-circle-play" onClick={() => {playingList.current = playList.current; playAll()}}></i>
          <i className="fa-solid fa-arrow-up-a-z" onClick={() => sortbyAtoZ()}></i>
          <i className="fa-solid fa-filter" onClick={() => setShowCommon(prevState => !prevState)}></i>
          <i className="fa-solid fa-eye-slash" onClick={() => {setHidden(prveHidden => !prveHidden);isHandleshuffle.current = true;}}></i>
          <i className="fa-solid fa-shuffle" onClick={() => shuffleHandler()}></i>
          <i className={appStyle.backgroundColor === nonDarkmodeStyle.backgroundColor? "fa-solid fa-sun" : "fa-solid fa-moon"}
          onClick={() => setAppStyle(appStyle.backgroundColor === nonDarkmodeStyle.backgroundColor? darkmodeStyle: nonDarkmodeStyle)}></i>
        </div>
      </div>
      <div className="App_input">
        <div className="App_input_inputbox">
          <div className="App_input_inputbox_head">
            <textarea className="App_input_inputbox_head_target"  value={target} onChange={e => setTarget(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            style={inputError ? {backgroundColor : "pink", border: "1px solid red"} : 
            appStyle.backgroundColor === "white" ? 
            {backgroundColor : "white", border: "1px solid black", color: "black"} : {backgroundColor : "black", border: "1px solid black", color: "#CCC"}}
            onKeyDown={e => handleKeyDown(e.key,submitHandler)} placeholder="Content"></textarea>
            <textarea className="App_input_inputbox_head_explication" style={appStyle} value={explication} onChange={e => setExplication(e.target.value)}
            onKeyDown={e => handleKeyDown(e.key,submitHandler)} placeholder="Explication"></textarea>
          </div>
          <div className="App_input_inputbox_buttom">
            <textarea className="App_input_inputbox_buttom_example" style={appStyle} value={example} onChange={e => {setExample(e.target.value);console.log(e.target.value==="\n")}}
            onKeyDown={e => handleKeyDown(e.key,submitHandler)} placeholder="Example"></textarea>
          </div>
        </div>
        <div className="App_input_submit">
        <i className="fa-solid fa-circle-check" onClick={() => submitHandler()}></i>
        </div>
        <br/>
        <br/>
      </div>
      {processedItems.map((x, index) => (
        <div key={index}>{x}</div>
      ))}
      <div className="App_modify" style={!isModify ? {display : "none"} : {display : "flex"}}>
        <div className="App_modify_inputbox">
          <div className="App_modify_inputbox_head">
            <textarea className="App_modify_inputbox_head_target" value={modifyTarget} onChange={e => setModifyTarget(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
            style={modifyError? {backgroundColor : "pink", border: "1px solid red"}:{backgroundColor : "white", border: "1px solid black"}}
            onKeyDown={e => handleKeyDown(e.key,modifyHandler)}></textarea>
            <textarea className="App_modify_inputbox_head_explication" value={modifyExplication} onChange={e => setModifyExplication(e.target.value)}
            onKeyDown={e => handleKeyDown(e.key,modifyHandler)}></textarea>
          </div>
          <div className="App_modify_inputbox_buttom">
              <textarea className="App_modify_inputbox_buttom_example" value={modifyExample} onChange={e => setModifyExample(e.target.value)}
              onKeyDown={e => handleKeyDown(e.key,modifyHandler)}></textarea>
          </div>
        </div>
        <div className="App_modify_submit">
          <i className="fa-solid fa-check" onClick={modifyHandler}></i>
          <i className="fa-solid fa-xmark" onClick={() => {setIsModify(false);setModifyExplication("");setModifyExample("")}}></i>
        </div>
      </div>
    </div>

    <div className="floatingObj">
      {playing &&
        <div><button className={playListPaused? "floatingObj_playallpause fa-solid fa-play" : "floatingObj_playallpause fa-solid fa-pause"} 
        style={appStyle.backgroundColor === "white" ? {color : "black"} : {color : "#CCC"}} onClick={() => 
        {playListPaused? speech.resume(): speech.pause(); setPlayListPaused(prevState => !prevState);}}></button></div>}
      {playing &&
        <div><button className="floatingObj_playallcancel fa-solid fa-power-off" style={appStyle.backgroundColor === "white" ? {color : "black"} : {color : "#CCC"}}
        onClick={() => {speech.cancel(); playingList.current.length = 0; setSearchWord(""); setPlaying(false);
        playingListRecursive.current.length = 0}}></button></div>}
      {/* This is a comment */}
      <div className="floatingObj_nextpage">
        <button className="floatingObj_nextpage_icon fa-solid fa-solid fa-arrow-right" style={appStyle.backgroundColor === "white" ? {color : "black"} : {color : "#CCC"}} 
        onClick={() => {preIndex.current = volIndex.current;setPageNo(prevState => prevState+1)}}></button>
      </div>
      {/* This is a comment */}
      <div className="floatingObj_findinpage">
        {showSearchBox &&
        <div className="floatingObj_findinpage_content">
          <input className="floatingObj_findinpage_content_box" value={searchWord} onChange={e => setSearchWord(e.target.value)}
          onKeyDown={e => handleKeyDown(e.key,submitHandler)} placeholder="Search..."></input>
          <i className="floatingObj_findinpage_content_x fa-solid fa-xmark" onClick={() => setSearchWord("")}></i>
        </div>}
        <button className="floatingObj_findinpage_icon fa-solid fa-magnifying-glass" style={appStyle.backgroundColor === "white" ? {color : "black"} : {color : "#CCC"}} 
        onClick={() => setShowSearchBox(prevState => !prevState)}></button>
      </div>
      <ToTopButton appStyle={appStyle.backgroundColor === "white" ? {color : "black"} : {color : "#CCC"}} />
    </div>
    {showConfirm &&  
    <Confirm appStyle={appStyle} close={() => setShowConfirm(false)} confirm={() => highlightHandler(highlightIndex.current,highlightContent.current)} >Highlight?</Confirm>}
    </>
  );
}

export default App;
