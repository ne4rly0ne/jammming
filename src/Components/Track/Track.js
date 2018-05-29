import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './Track.css';

class Track extends Component {
    constructor(props) {
        super(props);
        this.addTrack = this.addTrack.bind(this)
        this.removeTrack = this.removeTrack.bind(this)
        this.playTrack = this.playTrack.bind(this)
        this.stopTrack = this.stopTrack.bind(this)
        this.state =
        {
          playingTrack: false,
        };
    }

    renderAction() {
        if(!this.props.isRemoval) {
            return <a className="Track-action" onClick={this.addTrack}>+</a>
        } else {
            return <a className="Track-action" onClick={this.removeTrack}>-</a>
        }
    }

    addTrack() {
        this.props.onAdd(this.props.track)
    }

    removeTrack() {
        this.props.onRemove(this.props.track)
    }

    playTrack() {
      this.setState({playingTrack: true})
      this.props.onPlay(this.props.track)
    }

    stopTrack() {
      this.setState({playingTrack: false})
      this.props.onPlay('')
    }

    render() {
        let audioPlayer = <p className="Track-action" onClick={this.playTrack}>Play</p>
          if (this.props.currentPreview === this.props.track.id && this.state.playingTrack) {
            audioPlayer = (
              <div>
                <ReactAudioPlayer
                  src={this.props.track.preview}
                  autoPlay
                  // controls
                  />
                  <p className="Track-action" onClick={this.stopTrack}>Stop</p>
                </div>
            )
          }

        return (
            <div className="Track">
              <div className="Track-information">
                <h3>{this.props.track.name}</h3>
                <p>{this.props.track.artist} | {this.props.track.album}</p>
              </div>
              {this.renderAction()}
              <div>{audioPlayer}</div>
            </div>
        )
    }
}

export default Track;
