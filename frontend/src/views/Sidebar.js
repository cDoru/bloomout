import React, {Component} from 'react';
import {LinkTo} from '../LinkTo';
import {slide as Menu} from 'react-burger-menu';
import Images from '../assets';

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }
  handleMenuClick = () => {
    this.setState({isOpen: false});
  };
  render() {
    return (
      <div className="bgMenu dark-theme">
        <Menu isOpen={this.state.isOpen}>
          <div style={{
            display: "flex",
            flexDirection: "column",
          }}>
            <div>
              <img src={Images.logoSide} role="presentation" style={{ margin: "1.2em 0.5em 2em"}}/>
            </div>
            <div className="side-navlist">
              <div><LinkTo onClick={this.handleMenuClick} left="/overview/intro" right="/overview/basic">Overall risks</LinkTo></div>
              <div><LinkTo onClick={this.handleMenuClick} left="/overview/basic" right="/overview/detailed">Risks per project</LinkTo></div>
              <div><LinkTo onClick={this.handleMenuClick} left="/employees/basic" right="/employees/detailed">Employee risks</LinkTo></div>
              <div><LinkTo onClick={this.handleMenuClick} left="/people/basic" right="/people/detailed">Engagement</LinkTo></div>
              <div><LinkTo onClick={this.handleMenuClick} left="/overview/intro" right="/overview/basic">Interactions</LinkTo></div>
            </div>
            <footer style={{
              position: "absolute",
              bottom: "1em",
              left: "1em",
              margin: "1em",
              fontSize: "0.7em"
            }}>&copy; Bloomout - HackBack team</footer>
          </div>
         
        </Menu>
      </div>
    );
  }
}

export default Sidebar;
