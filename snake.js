const getDefaults = ()=> {
    return {
            squareH:16, squareW:16, totalAreaH:800, totalAreaW:800,rows:0,cols:0
            ,snakeLength:10,snakeDirection:0, //0=right,1=left,2=top,3=bottom,4=blocked
            snakeCoordinates:[], // object of {x:int,y:int}
            crawlSpeed:100,crawlerTimer:null, foodType: null, // 0= simple food, 1=spacial food
            foodCoords:null,tailHistory:[],foodTimer:null,paused:false,
            totalScore:0,maxScore:0,simpleFoodPoint:1,spacialFoodPoint:9,simpleScore:0,spacialScore:0// of type {x,y}
        };
}
let {squareH,squareW,totalAreaH,totalAreaW,rows,cols,
     snakeLength,snakeDirection,snakeCoordinates,crawlSpeed,crawlerTimer,foodTimer,foodType,foodCoords,totalScore,maxScore,
    simpleFoodPoint, spacialFoodPoint, simpleScore, spacialScore,tailHistory,paused} = getDefaults();

const resetSettings = ()=> {
    let _defaults = getDefaults();
    snakeLength = _defaults.snakeLength;
    snakeDirection = _defaults.snakeDirection;
    snakeCoordinates = _defaults.snakeCoordinates;
    crawlSpeed = _defaults.crawlSpeed;
    crawlerTimer = _defaults.crawlerTimer;
    foodType = _defaults.foodType;
    foodCoords = _defaults.foodCoords;
    totalScore = _defaults.totalScore;
    crawlerTimer = _defaults.crawlerTimer;
    simpleScore = _defaults.simpleScore;
    spacialScore = _defaults.spacialScore;
    tailHistory = _defaults.tailHistory;
    foodTimer = _defaults.foodTimer;  
    paused = _defaults.paused;
    showScore();
    $('#food-icon').remove();
    $('.snake').removeClass('snake');
    $('#startBtn').prop( "disabled", false );
    $("#pauseBtn").prop( "disabled", true );
    $("#cancelBtn").prop( "disabled", true );
}
const randomInt = (min, max)=> {
    return min + Math.floor((max - min) * Math.random());
}
const getSquareCountsinCol = ()=>{
    return Math.floor(totalAreaW/squareW);
}
const getSquareCountsinRow = ()=>{
    return Math.floor(totalAreaH/squareH);
}
const renderSquares= (rows,cols)=>{
    let mainDiv= $('#main-area');
    mainDiv.html('');
    let html='';
    for(let i=0;i<rows;i++){
        for(let j=0;j<cols;j++){
          html +=  `<div id='${i}-${j}' class='square'></div>`;
        }
    }
    mainDiv.html(html);
}
const getSnakeStartPoint = ()=>{
    return randomInt(0, rows-1);
}
const generateSnakeDefaultCoordinates=()=>{
    snakeCoordinates=[];
    let y = 0, x = getSnakeStartPoint();
    snakeCoordinates.push({x,y});
    addSnakePoint(x,y);
}
const addSnakePoint = (x,y)=>{
    let el = $(`#${x}-${y}`);
    if(el)
    el.addClass("snake"); 
}
const removeSnakePoint = (x,y)=>{
    let el = $(`#${x}-${y}`);
    if(el)
    el.removeClass('snake'); 
}
const nextPosiblePoint = (head) => {
        switch(snakeDirection){
           case 0: { // right side
             let x = head.x,y=-1;
               if((head.y + 1) <= (cols-1))
               {
                  y=head.y+1;
               } 
               else {
                   y = 0
               }
             return {x,y};
           }
           case 1:{ // left side
              let x = head.x, y;
               if((head.y - 1) >= 0)
                {
                  y=head.y-1;
                } 
                else {
                   y = (cols-1);                    
                }
             return {x,y};
           }
           case 2:{ // up side
             let x, y = head.y;
               if((head.x - 1) >= 0)
               {
                  x = head.x-1;                   
                } 
               else {
                   x = (rows-1); 
               }
             return {x,y};
           }
           case 3:{ // down side
             let x,y = head.y;
               if((head.x + 1) <= (rows-1)){
                   x = head.x+1;                   
               } else {
                   x = 0;                    
               }
             return {x,y};
           }
           case 4:{
             return null;
           }
        }
}
const getFoodRandomCoords = ()=>{
    let point=null;
    while(true){
        let pointX = randomInt(0, rows-1);
        let pointY = randomInt(0, cols-1);
        let insideSnake = !!snakeCoordinates.find((m)=> m.x === pointX && m.y=== pointY);
        if(!insideSnake){
            point = {x: pointX, y: pointY};
            break;
        }
    }
    return point;    
}
const addFood = ()=> {
    let point = foodCoords = getFoodRandomCoords();
    let el = $(`#${point.x}-${point.y}`);
    if(el){
        el.html('<i id="food-icon" class="fas fa-cookie-bite"></i>');
    }
}
const addSpacialFood = ()=>{
    let point = foodCoords = getFoodRandomCoords();
    let el = $(`#${point.x}-${point.y}`);
    if(el){
        el.html('<i id="food-icon" class="fas fa-apple-alt fa-2x"></i>');
    }
}
const showFoods = ()=>
{
    if(snakeDirection !== 4 && foodTimer){
        let type = randomInt(0,2);
        if(type===2){
            type=1;
        }
        foodType = type;
        if(foodType===0)
        {        
            addFood();
        } else {
            addSpacialFood();        
        }
    }
}
const hideFood = ()=> {
    let point = foodCoords;
    let el = $(`#${point.x}-${point.y}`);
    if(el){
        el.html('');
    }
}
const consumeFood = (head)=> {
    if(foodCoords && head.x === foodCoords.x && head.y === foodCoords.y){
        hideFood();
        let snakeIncreament=0;
        if(foodType === 0){
            totalScore += simpleFoodPoint;
            simpleScore++;
            snakeIncreament = 1;
        } else {
            totalScore += spacialFoodPoint;
            spacialScore++;
            snakeIncreament = 2;
        }
        if(totalScore > maxScore){
            maxScore = totalScore;
        }
        while(snakeIncreament--){
            snakeLength++;
            let lastInHistory = tailHistory.pop();
            if(lastInHistory){
                snakeCoordinates.push(lastInHistory);
            }
        }
        
        showScore();
        showFoods();
    }
}
const showScore = ()=>{
    $('#maxScore').html(maxScore);        
    $('#totalScore').html(totalScore);
    $('#simpleScore').html(simpleScore);        
    $('#spacialScore').html(spacialScore);
}
const startCrawling = ()=> {
        foodTimer = setTimeout(()=>{
            showFoods();    
        }, 1000*snakeLength); 
    
       crawlerTimer = setInterval(()=>{
       let head = snakeCoordinates[0], tail = null; // last item removed and will be added to top head
       let nextCoords = nextPosiblePoint(head);
       if(nextCoords){
            let insideSnake = !!snakeCoordinates.find((m)=> m.x === nextCoords.x && m.y === nextCoords.y);
            if(insideSnake){
                clearTimers();
                alert('GAME OVER!!!');
                resetSettings();
                return;
            }
           tail = snakeCoordinates.pop()
           consumeFood({...nextCoords});
           snakeCoordinates.splice(0, 0, nextCoords); // added tail to head
           tailHistory.push(tail);
           addSnakePoint(nextCoords.x, nextCoords.y); // reflect on DOM
           
           if(snakeCoordinates.length < snakeLength){ // if snake is not fully rendered it will add up remaining tails
               snakeCoordinates.push(tail);
               addSnakePoint(tail.x, tail.y);
           } else {
               removeSnakePoint(tail.x, tail.y);
           }
       } else {
           cancelGame();
       }
    }, crawlSpeed);
}
const startGame=()=>{
    generateSnakeDefaultCoordinates();
    startCrawling();
    $('#startBtn').text('Start Again').prop( "disabled", true );
    $("#pauseBtn").text('Pause').prop( "disabled", false );
    $("#cancelBtn").prop( "disabled", false );
}
const pauseGame=()=>{
    paused = !paused;
    $('#startBtn').prop( "disabled", true );
    if(!paused){
        resumeGame();
        $("#pauseBtn").text('Pause').prop( "disabled", false);
    } else {
        $("#pauseBtn").text('Resume').prop( "disabled", false);
        if(crawlerTimer){
          clearInterval(crawlerTimer);
        }
        if(foodTimer){
            clearTimeout(foodTimer);  
        }
    }
}
const resumeGame = ()=>{
    startCrawling();
}
const clearTimers = ()=>{
    if(crawlerTimer){
      clearInterval(crawlerTimer);
    }
    if(foodTimer){
        clearTimeout(foodTimer);  
    }
}
const cancelGame=()=>{
    clearTimers();
    resetSettings();
}
const onNavigationKey = (e)=>{
    switch(e.keyCode)
    {
        case 37:{ // array left
            console.log(e);
            if(snakeDirection===2 || snakeDirection===3){
                snakeDirection = 1;
            }
            break;
        }
        case 38:{ // array up
            console.log(e);
            if(snakeDirection===0 || snakeDirection===1){
                snakeDirection = 2;
            }
            break;
        }
        case 39:{ // array right
            console.log(e);
            if(snakeDirection===2 || snakeDirection===3){
                snakeDirection = 0;
            }
            break;
        }
        case 40:{ // array down
            console.log(e);
            if(snakeDirection===0 || snakeDirection===1){
                snakeDirection = 3;
            }
            break;
        }
    }
}
$(()=>{
    rows = getSquareCountsinRow();    
    cols = getSquareCountsinCol();
    renderSquares(rows,cols);
    document.onkeydown = onNavigationKey;
    $('#startBtn').text('Start').prop( "disabled", false );
    $("#pauseBtn").prop( "disabled", true );
    $("#cancelBtn").prop( "disabled", true );
});