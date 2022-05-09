
import React, { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import RoomApi from "../../../common/api/Room";

import style from '../style/Catchmind.module.scss';
import Pen from '../../../assets/pen.png';
import Eraser from '../../../assets/eraser.png';
import Delete from '../../../assets/delete.png';
import Undo from '../../../assets/undo.png';
import { uptime } from "process";

type MyProps = {
    initData : {answer : string, id : string, nextId : string} | undefined,
    user : any
}

function Catchmind({initData, user} : MyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [first, setFirst] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number>(10);
    const [mousePos, setMousePos] = useState<{x : number, y : number} | undefined>();
    const [isActive, setIsActive] = useState<boolean>(false);
    const [timeFlag, setTimeFlag] = useState<boolean>(false);
    const [myTurn, setMyturn] = useState<boolean>(false);
    const [nextTurn, setNext] = useState<boolean>(false);
    const [time, setTime] = useState<number>(60000000000);
    const [imgTime, setImgTime] = useState<number>(5);
    const [init, setInit] = useState<boolean>(false);
    const [idx, setIdx] = useState<number>();
    const [last, setLast] = useState<boolean>(false);
    const [lastTime, setLastTime] = useState<number>(300000000);
    const [inputData, setInputData] = useState<string>("");
    const [imgStatus, setImgStatus] = useState<boolean>(false);
    const [allImage, setAllimage] = useState<string[]>([]);
    const [ansFlag, setAnsFlag] = useState<boolean>(false);
    const [end, setEnd] = useState<boolean>(false);
    const [src, setSrc] = useState<string>("");
    const [color, setColor] = useState<string>("#000000");
    const [undoArr, setUndoArr] = useState<any[]>([]);
    const [undoIdx, setUndoIdx] = useState<number>(-1);
    const [lineWidth, setLineWidth] = useState<{num : number , flag : boolean}[]>(
        [
            {num : 5, flag : true},
            {num : 14, flag : false},
            {num : 26, flag : false},
            {num : 42, flag : false}
        ]
    );
    const [drawMode, setDrawMode] = useState<boolean>(false);


    const {getUploadImageResult} = RoomApi;

    const undoArrRef = useRef(undoArr);
    undoArrRef.current = undoArr;
    const undoIdxRef = useRef(undoIdx);
    undoIdxRef.current = undoIdx;

    const startTimeRef = useRef(startTime);
    startTimeRef.current = startTime;

    const nextRef = useRef(nextTurn);
    nextRef.current = nextTurn;

    const imgTimeRef = useRef(imgTime);
    imgTimeRef.current = imgTime;

    const lastTimeRef = useRef(lastTime);
    lastTimeRef.current = lastTime;

    const handleResize = debounce(() => {
        if(!canvasRef.current) return;
        const canvas : HTMLCanvasElement = canvasRef.current;
        const p : HTMLDivElement = document.getElementById("parent") as HTMLDivElement;
        
        const ctx = canvas.getContext('2d');
        const temp = ctx?.getImageData(0,0,canvas.width, canvas.height) as ImageData;
        
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.width = p.offsetWidth;
        canvas.height = p.offsetHeight;
        console.log(temp);
        ctx?.putImageData(temp, 0, 0);
    }, 500);

    const handleChangeColor = (e : React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.currentTarget.value);
        setColor(e.currentTarget.value);
    }
    const handleClickPen = () => {
        setDrawMode(false);
    }
    const handleClickEraser = () => {
        setDrawMode(true);
    }
    const handleClickClear = () => {
        if(!canvasRef.current) return;
        const canvas : HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx?.clearRect(0,0,canvas.width, canvas.height);
        ctx?.beginPath();
        setUndoArr([]);
    }
    const handleClickUndo = () => {
        if(!canvasRef.current) return;
    
        const canvas : HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        ctx?.clearRect(0,0,canvas.width, canvas.height);
        ctx?.beginPath();
        
        if(undoArrRef.current.length >= 1){
            console.log(undoArrRef.current);
            let undo = undoArr;
            undo.pop();
            if(undo[undo.length-1] instanceof ImageData) ctx?.putImageData(undo[undo.length-1],0,0);
            setUndoArr([...undo]);
        }     
    }
    const handleCtrlZ = (e : KeyboardEvent) => {
        if(e.ctrlKey && (e.key === 'z' || e.key === 'Z')){
            handleClickUndo();
        }
    }
    const handleClickLineWidth = (e : React.MouseEvent<HTMLButtonElement>) => {
        console.log(e.currentTarget.value);
        const target = +e.currentTarget.value;
        setLineWidth(lineWidth.map((v : {num : number, flag : boolean}, i : number) => v.num === target ? {...v, flag : true} : {...v, flag : false}));
    }


    const getPosition = (e : MouseEvent) => {
        if(!canvasRef.current){
            return;
        }
        const canvas : HTMLCanvasElement = canvasRef.current;
        console.log(e.pageX, e.pageY, canvas.offsetLeft, canvas.offsetTop);
        return {
            x : e?.pageX - canvas.offsetLeft,
            y : e?.pageY - canvas.offsetTop
        }
    }
    const drawLine = (original : {x : number, y : number}, newpos : {x : number, y : number}) => {
        if(!canvasRef.current){
            return;
        }
        
        const canvas : HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if(ctx){
            console.log("?여긴 되누??");
            if(!drawMode) ctx.strokeStyle = color;
            else ctx.strokeStyle = "#ffffff";
            ctx.lineJoin = 'round';

            for(let i = 0; i < lineWidth.length; i++){
                if(lineWidth[i].flag){
                    ctx.lineWidth = lineWidth[i].num;
                    break;
                }
            }

            ctx.beginPath();
            ctx.moveTo(original.x, original.y);
            ctx.lineTo(newpos.x, newpos.y);
            ctx.closePath();
            ctx.stroke();
            
        }

    }
    const startDraw = useCallback((e : MouseEvent) => {
        const position = getPosition(e);
        console.log("?여긴 start");
        if(position){
            setIsActive(true);
            setMousePos(position);
        }
    },[]);
    const draw = useCallback((e : MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if(isActive){
            const newMousePos = getPosition(e);
            if(mousePos && newMousePos){
                drawLine(mousePos, newMousePos);
                setMousePos(newMousePos);
            }
            else{
                console.log("하하하하하하하하하하하ㅏ하하하");
            }
        }
        else{
            
            
        }
    },[isActive, mousePos]);
    const exit = useCallback(() => {
        if(!canvasRef.current){
            return;
        }
        if(!canvasRef.current) return;
        const canvas : HTMLCanvasElement = canvasRef.current;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        let undo = undoArrRef.current;
        undo.push(ctx.getImageData(0,0,canvas.width, canvas.height));
        setUndoArr([...undo]);
        setIsActive(false);
    },[]);

    const handleChangeValue = (e : React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setInputData(value);
    }
    const handleKeyDownEnter = (e : React.KeyboardEvent) => {
        if(e.key === 'Enter'){
            sendAnswer();
        }
    }

    const sendSignal = async () => {
        if(!canvasRef.current) return;

        const canvas : HTMLCanvasElement = canvasRef.current;
        const newCanvas : HTMLCanvasElement = canvas.cloneNode(true) as HTMLCanvasElement;
        const ctx = newCanvas.getContext('2d') as CanvasRenderingContext2D;
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0,0,newCanvas.width,newCanvas.height);
        ctx.drawImage(canvas,0,0);

        const image = newCanvas.toDataURL("image/jpeg");
        const blobBin = atob(image.split(",")[1]);
        const array = [];
        for(let i = 0; i < blobBin.length; i++){
            array.push(blobBin.charCodeAt(i));
        }
        const file = new Blob([new Uint8Array(array)], {type : "image/jpeg"});
        const newFile = new File([file], `${user.getStreamManager().stream.streamId}.jpeg`);
        
        const formData = new FormData();
        formData.append("image", newFile);
        console.log(newFile);

        const result = await getUploadImageResult(formData);
        console.log(result.data);
        if(result.data !== null){
            const data = {
                streamId : user.getStreamManager().stream.streamId,
                gameStatus : 2,
                gameId : 1,
                index : idx,
                imageUrl : result.data
            }
            user.getStreamManager().stream.session.signal({
                data : JSON.stringify(data),
                type : "game"
            });
            setMyturn(false);
        }
    }
    const sendAnswer = () => {
        const data = {
            streamId : user.getStreamManager().stream.streamId,
            gameStatus : 2,
            gameId : 1,
            index : idx,
            response : inputData,
            imageUrl : ""
        }
        user.getStreamManager().stream.session.signal({
            data : JSON.stringify(data),
            type : "game"
        });
        setLast(false);
    }

    useEffect(()=>{
        let countDown : any;
        if(last){
            countDown = setInterval(()=>{
                if(lastTimeRef.current === 0){
                    clearInterval(countDown);
                    sendAnswer();
                }
                else{
                    setLastTime(lastTimeRef.current-1);
                }
            }, 1000);
            return () => clearInterval(countDown);
        }
        else{
            clearInterval(countDown);
            
        }
    }, [last])

    useEffect(()=>{
        let countDown : any;
        if(timeFlag){
            countDown = setInterval(()=>{
                if(time === 0){
                    clearInterval(countDown);
                    // us
                    setTimeFlag(false);
                    sendSignal();
                }
                else{
                    setTime(time-1);
                }
            }, 1000);
            return () => clearInterval(countDown);
        }
        else{
            console.log("?????");
            clearInterval(countDown);
        }
    }, [timeFlag,time]);
    useEffect(()=>{
        let countTime : any;
        if(imgStatus){
            countTime = setInterval(()=>{
                console.log("왜 안될까용??", imgTimeRef.current);
                if(imgTimeRef.current === 0){
                    clearInterval(countTime);
                }
                else{
                    setImgTime(imgTimeRef.current-1);
                }
            },1000)
            setTimeout(()=>{
                setImgStatus(false);
                setTimeFlag(true);
            }, 5000);
        }
        else{
            clearInterval(countTime);
        }
    },[imgStatus])
    
    useEffect(()=>{
        if(myTurn && !imgStatus){
            if(!canvasRef.current) return;
            
            const canvas : HTMLCanvasElement = canvasRef.current;
            const p : HTMLDivElement = document.getElementById("parent") as HTMLDivElement;
            
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.width = p.offsetWidth;
            canvas.height = p.offsetHeight;
            console.log("????왜 안됨요??");    
        }
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [myTurn, imgStatus]);
    useEffect(() => {
        if(!canvasRef.current) return;
        console.log("??SA?DAS?D?ASD?GSDBVISDHNVKLJSDHFUISDFH");
        const canvas : HTMLCanvasElement = canvasRef.current;
        const p : HTMLDivElement = document.getElementById("parent") as HTMLDivElement;
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', exit);
        window.addEventListener('keydown', handleCtrlZ);

        // canvas.addEventListener('mouseleave', exit);
        return () => {
            canvas.removeEventListener('mousedown', startDraw);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', exit);
            window.removeEventListener('keydown', handleCtrlZ);

            // canvas.removeEventListener('mouseleave', exit);
        }

    }, [myTurn, imgStatus, startDraw, draw, exit]);
    
    useEffect(() => {
        if(user.getStreamManager().stream.streamId === initData?.id){
            setFirst(true);
        }
        let countTime = setInterval(()=>{
            console.log("왜 안될까용??", startTimeRef.current);
            if(startTimeRef.current === 0){
                clearInterval(countTime);
            }
            else{
                setStartTime(startTimeRef.current-1);
            }
        },1000)
        setTimeout(()=>{
            setInit(true);
            setIdx(1);
            if(user.getStreamManager().stream.streamId === initData?.id){
                setMyturn(true);
                setTimeFlag(true);
            }
            if(user.getStreamManager().stream.streamId === initData?.nextId){
                setNext(true);
            }
        }, 10000);
        user.getStreamManager().stream.session.on("signal:game", (response : any) => {
            console.log(response.data, "여긴 게임 안이에요");
            console.log(user.getStreamManager().stream.streamId, user.getStreamManager().stream.streamId === response.data.curStreamId);

            if(response.data.answerYn){
                const imagesrc = response.data.allImages.split('|');
                console.log(imagesrc);
                if(response.data.answerYn === 'Y') {
                    setAnsFlag(true);
                    setEnd(true);
                    setAllimage([...imagesrc]);
                }
                else{
                    setEnd(true);
                    setAllimage([...imagesrc]);
                }
            }
            else{
                if(response.data.orderStatus === 0 || response.data.orderStatus === 1){
                    if(user.getStreamManager().stream.streamId === response.data.curStreamId){
                        console.log(nextRef.current, "씨발");
                        if(nextRef.current){
                            console.log("???왜 안됨 제발 제발");
                            setMyturn(true);
                            // setTimeFlag(true);
                            setImgStatus(true);
                            setSrc(response.data.imageUrl);
                            setNext(false);
                            setIdx(response.data.index);
                        }
                    }
                    if(user.getStreamManager().stream.streamId === response.data.nextStreamId){
                        setNext(true);
                    }
                }
                else if(response.data.orderStatus === 2){
                    if(user.getStreamManager().stream.streamId === response.data.curStreamId){
                        if(nextRef.current){
                            setNext(false);
                            setIdx(response.data.index);
                            setSrc(response.data.imageUrl);
                            setLast(true);
                        }
                    }
                }
            }
        });
    },[]);


    return(
        <>
        {init === false ? (
            <div style={{
                width : "60vw",
                height : "80vh",
                backgroundColor : "black",
                marginTop : "-10vh",
                // overflow : "auto",
                display : "flex",
                flexDirection : "column",
                justifyContent : "center",
                borderRadius : 10
            }}>
                <h1 style={{color : "white", margin : "4vh auto"}}>캐치마인드 🤔</h1>
                <ol className={style.desc}>
                    <li>첫 번째 사람은 제시어를 보고 제한시간안에 그림으로 묘사 해주세요</li>
                    <li>다음 사람부터 전 사람이 그린 그림을 보고 최대한 유사하게 그림을 그려주세요</li>
                    <li>마지막 사람은 최종 결과물을 보고 정답을 맞춰주세요</li>
                    <li>게임 진행 순서는 모두 랜덤입니다! 긴장 풀지 마세요!</li>
                </ol>
                {first ? (<div style={{
                    color : "white",
                    margin : "1vh auto"
            }}>당신은 첫번째 순서입니다.</div>) : null}
            <div style={{
                color : "white",
                margin : "1vh auto",
            }}>{startTime}초 후 시작됩니다!</div>
            </div>
        ): (
            <div id="parent" style={{
                width : "60vw",
                height : "80vh",
                backgroundColor : "white",
                marginTop : "-10vh",
                // overflow : "auto",
                borderRadius : "10px"
            }}>
            {last === true ? (
                <div style={{
                    position : "relative"
                }}>
                    <div style={{
                        position : "absolute",
                        fontSize : "2rem",
                        right : 0,
                        marginTop : "2vh",
                        marginRight : "2vw",
                        color : "black"
                    }}>{lastTime}</div>
                    <img style={{
                        width : "60vw",
                        height : "80vh",
                        objectFit : "cover",
                        borderRadius : "10px"
                    }} src={src}></img>
                    <input className={style.answerInputBox}
                    onChange = {handleChangeValue} onKeyDown={handleKeyDownEnter} placeholder="정답을 입력해주세요"></input>
                </div>
            ) : null}
            {myTurn === true? 
                imgStatus === true ? 
                (
                    <div style={{
                        position : "relative"
                    }}>
                        <div style={{
                            position : "absolute",
                            color : "red",
                            fontSize : "2rem",
                            right : 0,
                            marginTop : "3vh",
                            marginRight : "2vw"
                        }}>{imgTime}</div>
                        <img style={{
                            width : "60vw",
                            height : "80vh",
                            objectFit : "cover",
                            borderRadius : "10px"
                        }} src={src}></img>
                    </div>
                ) 
                : (<>
                    <div className={style.container}>
                        {first ? (<div className={style.answerBox}>
                            제시어
                            <div className={style.answer}>{initData?.answer}</div>
                        </div>) : null}
                        <div className={style.timer}
                            style={ time < 10 ? {
                                color : "red"
                            } : { color : "black"}}>
                            {time}
                        </div>
                        <div style={{
                            position : "absolute",
                            width : "8vw",
                            height : "35vh",
                            padding : "10px",
                            backgroundColor : "white",
                            borderRadius : "15px",
                            display : "flex",
                            flexDirection : "column",
                            filter : "drop-shadow(0px 50px 60px rgba(0, 0, 0, 0.15))",
                        
                            alignItems : "center",
                            top : "20vh",
                            right : "1vw",
                        }}>
                            <div style={{border : "5px solid #999999",borderRadius : "99999px", width : "4vw", height : "4vw", margin : "2vh 0", overflow : "hidden"}}>
                                <input style={{width : "200%", height : "200%", border : "none", transform: "translate(-25%, -25%)"}} type="color" onChange={handleChangeColor} defaultValue={color}></input>
                            </div>
                            {/* <input type="text"></input> */}
                            <div style={{
                                width : "100%",
                                display : "flex",
                                justifyContent : "center",
                                alignItems : "center",
                                marginBottom : "5px"
                            }}>
                                <button className={style.toolBox} style={ drawMode ? 
                                {
                                    width : "50%",
                                    border : "none",
                                    borderBottom : "none"
                                }
                                : {
                                    width : "50%",
                                    border : "none",
                                    borderBottom : "2px solid #9900F0",
                                }}
                                    onClick = {handleClickPen}
                                ><img style={{
                                    width : "inherit"
                                }}src={Pen}/></button>
                                <button className={style.toolBox} style={ drawMode ? 
                                {
                                    width : "50%",
                                    border : "none",
                                    borderBottom : "2px solid #9900F0",
                                }
                                : {
                                    width : "50%",
                                    border : "none",
                                    borderBottom : "none"
                                }}
                                    onClick ={handleClickEraser}
                                ><img style={{
                                    width : "inherit"
                                }} src={Eraser}/></button>
                            </div>
                            <div style={{
                                width : "100%",
                                display : "flex",
                                justifyContent : "center",
                                alignItems : "center",
                                marginBottom : "5px"
                            }}>
                                <button className={style.toolBox} style={
                                    lineWidth[0].flag ? 
                                    {
                                        width : "50%",
                                        height : "5vh",
                                        border : "none",
                                        borderBottom : "2px solid #9900F0",
                                        fontSize : 16
                                    }
                                    :
                                    {
                                        width : "50%",
                                        height : "5vh",
                                        border : "none",
                                        borderBottom : "none",
                                        fontSize : 16
                                    }}
                                        value="5"
                                        onClick={handleClickLineWidth}
                                    >5px</button>
                                <button className={style.toolBox} style={
                                    lineWidth[1].flag ? 
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "2px solid #9900F0",
                                        fontSize : 16
                                    }
                                    :
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "none",
                                        fontSize : 16
                                    }}
                                        value="14"
                                        onClick={handleClickLineWidth}
                                    >14px</button>
                            </div>
                            <div style={{
                                width : "100%",
                                display : "flex",
                                justifyContent : "center",
                                alignItems : "center"
                            }}>
                                <button className={style.toolBox} style={
                                    lineWidth[2].flag ? 
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "2px solid #9900F0",
                                        fontSize : 16
                                    }
                                    :
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "none",
                                        fontSize : 16
                                    }}
                                        value="26"
                                        onClick={handleClickLineWidth}>26px</button>
                                <button className={style.toolBox} style={
                                    lineWidth[3].flag ? 
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "2px solid #9900F0",
                                        fontSize : 16
                                    }
                                    :
                                    {
                                        width : "50%",
                                        border : "none",
                                        borderBottom : "none",
                                        fontSize : 16
                                    }}
                                        value="42"
                                        onClick={handleClickLineWidth}>42px</button>
                            </div>
                            <div style={{
                                width : "100%",
                                display : "flex",
                                justifyContent : "center",
                                alignItems : "center",
                                marginTop : "5px"
                            }}>
                                <button className={style.toolBox} style={ 
                                {
                                    width : "50%",
                                    border : "none",
                                    // margin : "0 10px",
                                    borderBottom : "none"
                                }}
                                    onClick = {handleClickUndo}
                                ><img style={{
                                    width : "inherit"
                                }}src={Undo}/></button>
                                <button className={style.toolBox} style={ {
                                    width : "50%",
                                    border : "none",
                                    // margin : "0 10px",
                                    borderBottom : "none"
                                }}
                                    onClick ={handleClickClear}
                                ><img style={{
                                    width : "inherit"
                                }} src={Delete}/></button>
                            </div>
                        </div>
                    
                        <button className={style.submit} onClick={sendSignal}>제출</button>
                    </div>
                    <canvas ref={canvasRef}
                    style={{
                        zIndex : 9999,
                        backgroundColor : "white",
                        borderRadius : "10px",
                        // position : "absolute"
                    }}
                    // width={700} height={700}
                    ></canvas></>) 
                : 
                (<> 
                    {nextTurn === true ? (<> 기다려 다음은 너다</>)
                    : end === true ? (
                    <>
                        <div style={{
                            width : "60vw",
                            height : "inherit",
                            display : "grid",
                            gridTemplateColumns : "1fr 1fr 1fr",
                            gridTemplateRows : "1fr 1fr",
                        }}>
                            {allImage.map((v : string, i : number) => {
                                const idx = i;
                                if(idx == allImage.length-1) return;
                                return(
                                        <img key={idx} src ={`${v}`} style={{width : "100%", height : "100%", objectFit : "cover"}}/>
                                )
                            })}
                        </div>
                    </>)
                    : last === true ? null : (<>기다려</>)}
                </>)}
                    
                </div>)}
        </>
    )
}

export default Catchmind