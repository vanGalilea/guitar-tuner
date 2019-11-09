import React, {useEffect, useState} from "react";

const notes = [
    {name: "High E", frequency: 329.63},
    {name: "B", frequency: 246.94},
    {name: "G", frequency: 196.00},
    {name: "D", frequency: 146.83},
    {name: "A", frequency: 110.00},
    {name: "Low E", frequency: 82.41}
];

const getCurrentNoteToTune = (frequency) => {
    let frequencies = notes.map((note) => note.frequency);
    let closestNote = frequencies.reduce((prev, curr) => {
        return (Math.abs(curr - frequency) < Math.abs(prev - frequency) ? curr : prev);
    });
    return notes.find((note) => note.frequency === closestNote);
};

export default () => {
    const [pitch, setPitch] = useState()
    const [freq, setFreq] = useState()

    const setup = async () => {
        if (typeof window === "undefined") return null;
        const {mediaDevices} = window.navigator

        const MicStream = await mediaDevices.getUserMedia({audio: true, video: false});
        const audioContext = new AudioContext();
        const {pitchDetection} = require("ml5");

        const initialPitch = await pitchDetection(
            "./model",
            audioContext,
            MicStream
        );

        setPitch(initialPitch);
    };

    useEffect(() => {
        setTimeout(() => setup(), 1000)
    }, []);

    setInterval(() => {
        pitch && pitch.getPitch((err, frequency) => {
            if (frequency) {
                setFreq(frequency)
                console.log("freq ==>", frequency)
            }
            if (err) {
                console.log("ERROR", err);
            }
        });
    }, 100);

    const diffrenceToNote = freq - getCurrentNoteToTune(freq).frequency;

    return (
        <div className="outerContainer">
            <h2>Note: {getCurrentNoteToTune(freq).name}</h2>
            <br/>

            <div className="container">
                <div className="line">
                    <div className="currentFreq">
                        {diffrenceToNote && Math.round(diffrenceToNote)}
                    </div>
                </div>
            </div>

            <style jsx>
                {`
                
                    .outerContainer {
                        display: flex;
                        justify-content: center;
                        flex-direction: column;
                        align-items: center;
                    }
                    .container {
                        background-color: gray;
                        width: 500px;
                        height: 250px;
                        display: flex;
                        justify-content: center;
                        position: relative;
                    }
                    
                    .line {
                        width: 2px;
                        height: 100%;
                        background-color: green;
                        position: absolute;
                        display: flex;
                        justify-content: center;
                    }
                    .currentFreq {
                        width: 30px;
                        height: 30px;
                        border-radius: 25px;
                        border: 2px solid ${Math.abs(diffrenceToNote) <= 7 ? 'green' : 'red'};
                        background-color: #fff;
                        color: ${Math.abs(diffrenceToNote) <= 7 ? 'green' : 'red'};
                        position: absolute;
                        align-self: center;
                        margin-left: ${diffrenceToNote}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                    }
                `}
            </style>
        </div>
    );
};
