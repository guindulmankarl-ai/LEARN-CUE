# LearnCue Customized Starter

LearnCue is a responsive reading-practice prototype for children ages 4–7. It can be opened on a computer or Android browser and includes:
- Alphabet and letter sounds (browser speech support where available)
- Simple word practice
- Word-to-picture matching
- Listening and pronunciation using the browser's text-to-speech feature
- Short reading-comprehension stories and questions
- Stars and local progress tracking
- Optional Java Spring Boot backend endpoints

## Run on a computer
1. Extract this ZIP.
2. Open `frontend/index.html` directly, or open the `frontend` folder in VS Code and use Live Server.
3. Most activities work without the Java server.

## Run the Java backend (optional)
Requirements: Java 17+ and Maven.
1. Open a terminal in the `backend` folder.
2. Run `mvn spring-boot:run`.
3. Check `http://localhost:8080/api/health`.
4. Keep the frontend and backend running to send progress to the Java API.

## Use on Android
For a quick test, open the frontend through a web host/Live Server reachable from the phone on the same Wi-Fi network. `localhost` on an Android phone refers to the phone itself, not your computer, so change `API_BASE` in `frontend/app.js` to your computer's LAN address if testing the Java backend from a phone. For everyday installation, deploy the frontend to HTTPS and add a PWA manifest/service worker in a next step.

## Notes and limitations
- Speech uses the browser's built-in SpeechSynthesis API. Available voices depend on the device/browser; it does not record or score a child's spoken voice.
- Progress is saved in the browser on the current device. The Java sample backend keeps only the latest submitted progress in memory and resets when restarted.
- This is a prototype for school demonstration, not a production system. Do not enter sensitive personal information. Obtain school/parent permission before testing with children.
