import React,{useState} from 'react';
import './App.scss';
const Indian = {
  0:'',
  1:'',
  2:'hundred',
  3:'thousand',
  4:'thousand',
  5:'lac',
  6:'lac',
  7:'crore',
  8:'crore'
}


const Order=['crore','lac','thousand','hundred','']
String.prototype.chunk = function(size) {
  return [].concat.apply([],
      this.split('').map(function(x,i){ return i%size ? [] : this.slice(i,i+size) }, this)
  )
}

function numberToText(number){
  number = number.split("").reverse().join("")
  let chunks = []
  chunks.push(number.slice(0,9))
  number=number.slice(9,)
  while(number.length){
    chunks.push(number.slice(0,7))
    number = number.slice(7,)
  }
  
  return chunks.reverse().map((num, idx)=>getAnswerTillCrore(num.split("").reverse().join(""), idx < chunks.length - 1)).join(" ")
}

function getAnswerTillCrore(number, elevated=false){
  let stack = []
  let numbers = String(number).split("").map(i=>i).reverse()
  for(let i = 0; i < numbers.length;i+=1){
    stack.push({position:elevated ? Indian[i+2] : Indian[i], number: numbers[i]})
  }
  let agg = stack.reduce((agg, curr, idx)=>{
    agg[curr.position] = curr.number + (agg[curr.position] || "")
    return agg
  },{})

  let ans = Object.keys(agg).sort((b, a)=>Order[a]-Order[b]).map(position=>getDecimalValue(agg[position])+" "+position)
  return ans.reverse().join(" ");
}

function getDecimalValue(number){
    if(number.length === 1) return getDigitName(number)
    else{
      if(number[0] === '1'){
        switch(Number(number[1])){
          case 0:
            return 'ten'
          case 1:
            return  'eleven'
          case 2:
            return  'twelve'
          case 3:
            return  'thirteen'
          case 4:
            return  'fourteen'
          case 5:
            return  'fifteen'
          case 6:
            return  'sixteen'
          case 7:
            return  'seventeen'
          case 8:
            return  'eighteen'
          case 9:
            return  'nineteen'
        }
      }
      else{
        return getTens(number[0])+" "+getDigitName(number[1])
      }
    }
}

function getTens(digit){
  let name
  switch(Number(digit)){
      case 2:
        name= 'twenty'
        break
      case 3:
        name= 'thirty'
        break
      case 4:
        name= 'fourty'
        break
      case 5:
        name= 'fifty'
        break
      case 6:
        name= 'sixty'
        break
      case 7:
        name= 'seventy'
        break
      case 8:
        name= 'eighty'
        break
      case 9:
        name= 'ninety'
        break
  }
  return name
}

function getDigitName(digit){
  let name
  switch(Number(digit)){
      case 1:
        name= 'one'
        break
      case 2:
        name= 'two'
        break
      case 3:
        name= 'three'
        break
      case 4:
        name= 'four'
        break
      case 5:
        name= 'five'
        break
      case 6:
        name= 'six'
        break
      case 7:
        name= 'seven'
        break
      case 8:
        name= 'eight'
        break
      case 9:
        name= 'nine'
        break
  }
  return name
}

function App() {
  const [number, setNumber] = useState("");
  const copyToClipboard = event => {
      var copyText = document.getElementById("result");
      copyText.select();
      document.execCommand("copy");
  }
  return (
    <div className="App">
      <div className="header">

      </div>
      <div className="body n2w-container">
        <div className="n2w">
          <div className="number-input">
            <input type="number" value={number} placeholder="Enter number" onChange={e=>setNumber(e.target.value)}/>
          </div>
          <textarea readOnly className="text-container" id="result"
            value={numberToText(number)}/>
          <div className='copy' onClick={copyToClipboard}>COPY TO CLIPBOARD</div>
        </div>
      </div>
    </div>
  );
}
export default App;
