import { useState, useRef } from "react";

function App() {
	const [audioData, setAudioData] = useState(null);
	const [transcription, setTranscription] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [isTranscribing, setIsTranscribing] = useState(false);
	const mediaRecorder = useRef(null);

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder.current = new MediaRecorder(stream);

			const audioChunks = [];
			mediaRecorder.current.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.current.onstop = () => {
				const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
				setAudioData(audioBlob);
			};

			mediaRecorder.current.start();
			setIsRecording(true);
		} catch (error) {
			console.error("Error accessing microphone:", error);
		}
	};

	const stopRecording = () => {
		if (isRecording) {
			mediaRecorder.current.stop();
			setIsRecording(false);
		}
	};

	const transcribeAudio = async () => {
		if (!audioData) {
			alert("Please record audio first.");
			return;
		}

		setIsTranscribing(true);
		try {
			const formData = new FormData();
			formData.append("audio", audioData, "audio.mp3");

			const response = await fetch("http://127.0.0.1:5000/api/transcribe", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			setTranscription(data.text);
		} catch (error) {
			console.error("Error transcribing audio:", error);
		} finally {
			setIsTranscribing(false);
		}
	};

	return (
		<div className="flex justify-center align-middle items-center flex-col h-screen gap-8">
			<h1 className="text-5xl">Whisper Transcribe</h1>
			<div>
				{!isRecording ? (
					<button
						onClick={startRecording}
						className="p-4 rounded-full bg-red-800 text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
							/>
						</svg>
					</button>
				) : (
					<button
						onClick={stopRecording}
						className="p-4 rounded-full bg-yellow-800 text-white animate-pulse"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
							/>
						</svg>
					</button>
				)}
			</div>

			<div>
				{!isTranscribing ? (
					<button
						onClick={transcribeAudio}
						disabled={!audioData}
						className={`py-2 px-4 rounded-full bg-green-800 text-white ${
							!audioData && "opacity-50"
						}`}
					>
						Transcribe
					</button>
				) : (
					<div className="animate-spin">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
							/>
						</svg>
					</div>
				)}
			</div>

			{transcription && (
				<div>
					<h2>Transcription:</h2>
					<p>{transcription}</p>
				</div>
			)}
		</div>
	);
}

export default App;
