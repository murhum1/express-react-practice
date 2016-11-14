import ReactDOM from 'react-dom'
import React from 'react';
import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin';

import RoomList from './RoomList'
import App from './App'
import Room from './Room'

console.log("asd")
 
// Needed for onTouchTap 
// http://stackoverflow.com/a/34015469/988941 
injectTapEventPlugin();

ReactDOM.render((
	<Router history={hashHistory}>
		<Route path="/" component={App}>
			<Route path="roomList" component={RoomList}></Route>
			<Route path="rooms/:roomId" component={Room}></Route>
		</Route>
	</Router>
), document.getElementById('root'))