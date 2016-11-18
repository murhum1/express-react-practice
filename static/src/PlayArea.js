import React from 'react'
import Paper from 'material-ui/Paper'
import {Responsive, WidthProvider} from 'react-grid-layout'
import RaisedButton from 'material-ui/RaisedButton'
import globals from './globals'

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
			game: {},
			selectedCardIds: {}
		}
	}

  	componentDidMount() {
	    var c = this;
	    var socket = this.props.socket;
	    socket.on('gameStatus', function(status) {
	    	this.setState({game: status, ignoreCardClicks: false});
	    }.bind(this))

	    socket.on('correctSet', function(data) {
	    	_.forEach(c.state.game.activeCards, function(card) {
	    		card.selected = false;
	    		var cardInSet = _.find(data.set, function(setCard) {
	    			return card.id === setCard.id;
	    		});

	    		if (cardInSet) {
	    			card.cardInSet = true;
	    		}
	    	})
	    	c.setState({game: c.state.game, ignoreCardClicks: true})
	    })

	    socket.on('failSet', function(data) {
			if (data.socketId === socket.id) {
				_.forEach(c.state.game.activeCards, function(card) {
		    		if (card.selected) {
		    			card.failSet = true;
		    		}
	    			card.selected = false;
				})
				c.setState({game: c.state.game, ignoreCardClicks: true, ignoreTime: globals.FAIL_SET_IGNORE_TIME})
				c.ignoreInterval = setInterval(function() {
					if (c.state.ignoreTime === 0) {
						clearInterval(c.ignoreInterval);
						_.forEach(c.state.game.activeCards, function(card) {
							card.failSet = false;
						})
						c.setState({game: c.state.game, ignoreCardClicks: false})
					}
					else {
						c.setState({ignoreTime: c.state.ignoreTime - 1})
					}
				}, 1000);
			}
	    })
	}

	componentWillUnmount() {
		this.props.socket.removeAllListeners('message');
		this.props.socket.removeAllListeners('correctSet');
		this.props.socket.removeAllListeners('failSet');
		this.props.socket.removeAllListeners('updateRooms');
	}

	startGame() {
		this.props.socket.emit('startGame', this.props.roomId);
	}

	onCardClick(card) {
		if (this.state.ignoreCardClicks) return;
		card.selected = !card.selected;
		this.setState({game: this.state.game}, function() {
			var selectedCards = _.filter(this.state.game.activeCards, function(card) {
				return card.selected;
			})
			if (selectedCards.length === 3) {
				this.props.socket.emit('submitSet', { roomId: this.props.roomId, set:  selectedCards })
			}
		});
	}

	getCardBackground(card) {
		if (card.cardInSet) return 'rgba(0, 200, 0, 0.2)'
		if (card.failSet) return 'rgba(200, 0, 0, 0.2)'
		else if (card.selected) return 'rgba(0, 0, 0, 0.2)'
		else return '';
	}

	renderCard(card) {

		const CARD_HEIGHT = 85;
		const CARD_WIDTH = 140;

		const SHAPE_WIDTH = CARD_WIDTH / 5;

		const SHAPE_1_X = (CARD_WIDTH - SHAPE_WIDTH) / 2

		const SHAPE_2_LEFT_X = CARD_WIDTH / 3 - SHAPE_WIDTH / 2
		const SHAPE_2_RIGHT_X = (2 * CARD_WIDTH / 3) - SHAPE_WIDTH / 2

		const SHAPE_3_LEFT_X = CARD_WIDTH / 6 - SHAPE_WIDTH / 2
		const SHAPE_3_MIDDLE_X = 3 * CARD_WIDTH / 6 - SHAPE_WIDTH / 2
		const SHAPE_3_RIGHT_X = 5 * CARD_WIDTH / 6 - SHAPE_WIDTH / 2

		const STRIPE_FREQ = 0.07;


		function getFill(fillType) {
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

		function renderShapes() {

			function pathElement(path) {
				return <path key={Math.random()} d={path} fill={getFill(card.fill)} strokeWidth="3" stroke={card.color}></path>
			}

			function diamond(startX) {
				const left = startX;
				const middle = left + SHAPE_WIDTH / 2;
				const right = startX + SHAPE_WIDTH;

				const startY = CARD_HEIGHT / 2;
				const top = CARD_HEIGHT / 6;
				const bottom = 5 * CARD_HEIGHT / 6;

				const pathArray = [
					"M", left, startY,
					"L", middle, top,
					"L", right, startY,
					"L", middle, bottom,
					"Z"
				]

				const path = pathArray.join(" ");
				return pathElement(path)
			}

			function oval(startX) {
				const sideHeight = CARD_HEIGHT / 4;
				const curveHeight = CARD_HEIGHT / 4;
				const startY = (CARD_HEIGHT + sideHeight) / 2;
				const left = startX;
				const right = left + SHAPE_WIDTH;

				const pathArray = [
					"M", left, startY,
					"L", left, startY - sideHeight,
					"C", left, startY - sideHeight - curveHeight,
						 right, startY - sideHeight - curveHeight,
						 right, startY - sideHeight,
					"L", right, startY,
					"C", right, startY + curveHeight,
						 left, startY + curveHeight,
						 left, startY,
					"Z"
				];
				const path = pathArray.join(" ");
				return pathElement(path);
			}

			function S(startX) {
				
				startX = startX + SHAPE_WIDTH / 5;
				const left = startX - SHAPE_WIDTH / 5;

				const pathArray = [
					"M", startX, CARD_HEIGHT / 2,
					
					"C", startX, 3 * CARD_HEIGHT / 8,
						 left, 3 * CARD_HEIGHT / 8,
						 left, 3 * CARD_HEIGHT / 8,
					
					"C", left - SHAPE_WIDTH / 5, 3 * CARD_HEIGHT / 8,
						 left - SHAPE_WIDTH / 5, CARD_HEIGHT / 8,
						 left + SHAPE_WIDTH / 5, CARD_HEIGHT / 8,
					
					"C", left + 3 * SHAPE_WIDTH / 5, CARD_HEIGHT / 8,
						 left + 4 * SHAPE_WIDTH / 5, 3 * CARD_HEIGHT / 8,
						 left + 4 * SHAPE_WIDTH / 5, CARD_HEIGHT / 2,
					
					// Halfway

					"C", left + 4 * SHAPE_WIDTH / 5, 5 * CARD_HEIGHT / 8,
						 left + SHAPE_WIDTH, 5 * CARD_HEIGHT / 8,
						 left + SHAPE_WIDTH, 5 * CARD_HEIGHT / 8,

					"C", left + 6 * SHAPE_WIDTH / 5, 5 * CARD_HEIGHT / 8,
						 left + 6 * SHAPE_WIDTH / 5, 7 * CARD_HEIGHT / 8,
						 left + 4 * SHAPE_WIDTH / 5, 7 * CARD_HEIGHT / 8,

					"C", left + 2 * SHAPE_WIDTH / 5, 7 * CARD_HEIGHT / 8,
						 startX, 5 * CARD_HEIGHT / 8,
						 startX, CARD_HEIGHT / 2,
						 
					"Z"
				]
				const path = pathArray.join(" ");

				return pathElement(path)
			}

			if (card.shape === 'oval') {
				return drawShapesTemplate(oval);
			}
			else if (card.shape === 'diamond') {
				return drawShapesTemplate(diamond);
			}
			else {
				return drawShapesTemplate(S);
			}
		}

		function drawShapesTemplate(shapeFunc) {
			var shapes;
			if (card.number === 1) {
				shapes = [
					shapeFunc(SHAPE_1_X)
				]
			}
			else if (card.number === 2) {
				shapes = [
					shapeFunc(SHAPE_2_LEFT_X),
					shapeFunc(SHAPE_2_RIGHT_X)
				]
			}
			else {
				shapes = [
					shapeFunc(SHAPE_3_LEFT_X),
					shapeFunc(SHAPE_3_MIDDLE_X),
					shapeFunc(SHAPE_3_RIGHT_X)
				]
			}

			return (
				<g>
					{shapes.map((shape) => {
						return shape;
					})}
				</g>
			);			
		}



		return (
			<svg height={CARD_HEIGHT} width={CARD_WIDTH}>
				<defs>
					<pattern id="stripedblue" x="0%" y="0%" height={STRIPE_FREQ} width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="2" stroke="blue">
					  </line>
					</pattern>

					<pattern id="stripedred" x="0%" y="0%" height={STRIPE_FREQ} width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="2" stroke="red">
					  </line>
					</pattern>

					<pattern id="stripedgreen" x="0%" y="0%" height={STRIPE_FREQ} width="100%">
					  <line x1="0" x2="100%" y1="0" y2="0" strokeWidth="2" stroke="green">
					  </line>
					</pattern>
				</defs>
				{renderShapes()}
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
			      		return (<div onClick={() => c.onCardClick(card)} style={{transition: 'none', width: '100%', height: '100%'}} key={card.shape + card.fill + card.number + card.color} data-grid={{x: Math.floor(idx / 4), y: idx % 4, w: 1, h: 1, static: true}}>
			      			<Paper style={{width: '100%', height: '100%', padding: '10px', borderRadius: '4px', backgroundColor:c.getCardBackground(card)}} zDepth={1}>
			      				{c.renderCard(card)}
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