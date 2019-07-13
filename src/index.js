import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
const config = {
    onUpdate:registration=>{
        console.log('update found ', registration)
        if(window.confirm('New update is found. Update ?')){
            navigator.serviceWorker.getRegistrations()
            .then(registrations=>{
                for(let reg of registrations){
                    reg.unregister()
                }
                // registration.skipWating()
                window.location.reload();
            })
        }
    },
    onSuccess:registration=>{
        console.log('success fully installed ', registration)
    }
}
export function register(event){
    console.log('starting to register')
    serviceWorker.register(config);
}
