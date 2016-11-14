import React from 'react'
import Paper from 'material-ui/Paper'
import {Responsive, WidthProvider} from 'react-grid-layout'
import RaisedButton from 'material-ui/RaisedButton'
const ReactGridLayout = WidthProvider(Responsive);

var SVGComponent = React.createClass({
    render: function() {
        return <svg {...this.props}>{this.props.children}</svg>;
    }
});

export default class PlayArea extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			game: {}
		}
	}

  	componentDidMount() {
		console.log(this.props);
	    var socket = this.props.socket;
	    socket.on('gameStatus', function(status) {
	    	this.setState({game: status});
	    }.bind(this))
	}

	startGame() {
		this.props.socket.emit('startGame', this.props.roomId);
	}

	drawCard(card) {

		function getFill(fillType) {
			console.log(fillType);
			if (fillType === "empty") {
				return "none"
			}
			else if (fillType === "striped") {
				return "url(#striped" + card.color + ")"
			}
			else {
				return card.color;
			}
		}


		const HEIGHT = 85;
		const WIDTH = 140;
		return (
			<svg height={HEIGHT} width={WIDTH}>
				<defs>
					<g id="oval">
						<path d="M5.77229 25.7967c0,-13.0251 10.5629,-23.588 23.588,-23.588 13.0251,0 23.588,10.5629 23.588,23.588" />
						<path d="M5.77229 58.8144c0,13.0251 10.5629,23.588 23.588,23.588 13.0251,0 23.588,-10.5629 23.588,-23.588" />
						<line x1="5.77229" y1="25.7967" x2="5.77229" y2="58.8144" />
						<line x1="52.9483" y1="25.7967" x2="52.9483" y2="58.8144" />
					</g>

					<pattern id="stripedblue" x="0%" y="0%" height="0.12" width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="3" stroke="blue">
					  </line>
					</pattern>

					<pattern id="stripedred" x="0%" y="0%" height="0.12" width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="3" stroke="red">
					  </line>
					</pattern>

					<pattern id="stripedgreen" x="0%" y="0%" height="0.12" width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="3" stroke="green">
					  </line>
					</pattern>
				</defs>
				<use xlinkHref="#oval" fill="red"></use>
				<circle cx={WIDTH/2} cy={HEIGHT/2} r={HEIGHT/3} fill={getFill(card.fill)} strokeWidth="2" stroke={card.color}>
				</circle>
			</svg>
		)
	}

	renderGame() {
		var c = this;
		if (!c.state.game.started) {
			return (
				<div>
					<span>Game not started</span><br/>
					<span>{c.state.game.owner === c.props.socket.id ? <RaisedButton label="Start game" primary={true} onClick={c.startGame.bind(c)}></RaisedButton> : ""}</span>
				</div>
			)
		}
		else {
			return (
		      	<ReactGridLayout className="layout" rowHeight={105} cols={{lg: 5, md: 5, sm: 5, xs: 5}}>
		      		{
		      			this.state.game.activeCards.map((card, idx) => {
			      		return (<div style={{transition: 'none', width: '100%', height: '100%'}} id="lol" key={card.shape + card.fill + card.number + card.color} data-grid={{x: Math.floor(idx / 4), y: idx % 4, w: 1, h: 1, static: true}}>
			      			<Paper style={{width: '100%', height: '100%', padding: '10px', borderRadius: '4px'}} zDepth={1}>
			      				
			      				{c.drawCard(card)}
			      				{card.color}<br/>
			      				{card.fill}<br/>
			      				{card.number}<br/>
			      				{card.shape}
			      			</Paper>
			      		</div>)
		      		})}
		      	</ReactGridLayout>
			)
		}
	}

  render() {
    return (
      <Paper zDepth={2} style={{width:'100%', height: '100%', padding: '10px', float: 'left'}}>
      	{this.renderGame.apply(this)}
      </Paper>
    )
  }
}