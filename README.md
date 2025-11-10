# 🥗 CalorieQuest
**Because counting calories shouldn’t feel like filing your taxes.** 

A modern, AI-powered nutrition tracker that lets you log meals, talk to an AI that won’t judge you for eating pizza three days in a row (probably), and generally get your life together. Or at least, your diet.**

<img width="1021" height="928" alt="image" src="https://github.com/user-attachments/assets/760af2b6-2d03-4b4b-8efe-f907236824e3" />


---

So, you've decided to confront the nutritional reality of your life choices. Brave. Most people just close their eyes and hope for the best. CalorieQuest is for the courageous, the curious, and those who suspect their "healthy" salad might be a caloric Trojan horse.

This isn't your grandma's calorie counter. We use the all-powerful, slightly-scary magic of the Gemini AI to make logging food less of a chore and more of a... well, a slightly less tedious chore.

## ✨ Features (aka “How We Help You Face the Music”) 🎵

* **🤖 AI-Powered Confessional:**  
  Too lazy to type? Just *describe* your meal like a dramatic monologue (“a tragic tale of fries and regret”), or upload photo evidence. Our AI will analyze it, log it, and quietly judge you.

* **📚 The Culinary Archives:**  
  Search our vast database to find the nutritional truth about almost any food. Finally, scientific proof that your “light snack” was a 600-calorie ambush.

* **🗓️ Pretend You Have a Plan:**  
  Use the **Meal Planner** to map out your week of perfect eating before you inevitably summon pizza. You can even generate a full meal plan with one click — Gemini won’t tell anyone you didn’t plan it yourself.

* **💬 Consult the Oracle:**  
  Talk to our **AI Chatbot** for recipe ideas, fitness tips, or philosophical questions like “why do I crave sugar when I’m sad?” It’s here to help, not to judge. (Again, *probably*.)

* **🎯 Goals for Procrastinators:**  
  Set calorie and macro targets, then ignore them like a pro. Our “Weekly Balancing” feature even adjusts future goals to compensate for your ‘cheat days’. You’re welcome.

* **🔗 Shareable Shame:**  
  Generate a shareable, read-only link to your daily summary. Perfect for trainers, nutritionists, or that one friend who claims *they never eat carbs*.  

## 🏗 The Tech Stack (The Stuff That Makes the Magic Happen) ✨

Forged in the fires of modern web development and powered by an AI that's probably smarter than we are.

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **The Brains:** Google Gemini API
*   **Vibes:** Sarcasm, caffeine, and a healthy dose of reality.

## Getting Started: An In-Depth Guide for Absolute Beginners

Alright, let's get this show on the road. We're going to act like your computer is a mysterious magical box, and I'm the slightly-impatient wizard telling you which buttons to press.

### Step 0: The Magic Word Box (aka, The Terminal)

Before we do anything cool, you need to open the "Terminal." This is a scary-looking black (or white) window where you type commands to the computer. It's not going to break anything, probably.

*   **On a Mac:** Go to your Applications folder, then into the "Utilities" folder. You'll see an icon called "Terminal." Double-click it. Congratulations, you're a hacker now.
*   **On Windows:** Click the Start button and just type `cmd` or `PowerShell`. Click on "Command Prompt" or "Windows PowerShell" when it appears. Yes, it's that easy.

Keep this window open. This is our command center.

### Step 1: Obtain The Sacred Texts (aka, Download the Code)

You need to get the app's files onto your computer. We'll do this by "cloning" it, which is a fancy word for "copy-pasting a whole folder from the internet."

1.  Click your mouse inside that Terminal window you just opened.
2.  Carefully type (or copy and paste) this command and press **Enter**:
    ```bash
    git clone https://github.com/mkowalik-git/CalorieQuest.git
    ```
    You'll see some text flash by. This is the computer downloading things. Just let it cook.
3.  Once it's done, you've downloaded not just our app, but a whole collection! Now you need to go *into* the folder for this specific app. Type this command and press **Enter**:
    ```bash
    cd caloriequest
    ```
    The letters `cd` stand for "change directory." You've just told the computer, "Hey, walk into that folder for me." You are now standing inside the project. Don't touch anything yet!

### Step 2: The Super Secret Password (aka, The API Key)

Our app needs to talk to Google's big AI brain. To do that, it needs a secret password, called an **API Key**. Think of it as the secret knock to get into the AI's clubhouse.

1.  **Get the Key:**
    *   Open your web browser (Chrome, Firefox, etc.).
    *   Go to this website: (https://aistudio.google.com/api-keys)
    *   You might need to sign in with your Google account. Do it.
    *   Look for a button that says something like **"Get API Key"**. It's usually on the top left. Click it.
    *   A new window will pop up with an option to **"Create API key"**. Click that.
    *   You will see a long, nonsensical string of letters and numbers. This is your key. It's very important. **Copy this entire key.**

2.  **Create a Hiding Spot for the Key:**
    *   Go back to the project folder on your computer (the `caloriequest` one you `cd`-ed into).
    *   Inside this folder, you must create a **new, blank file**.
    *   You must name this file `exactly` this: `.env`
    *   Yes, it starts with a dot. Yes, that's weird. Just do it. Don't name it `env.txt` or `my_secrets`. It has to be `.env`.
    *   Open this new `.env` file with any simple text editor (like Notepad on Windows or TextEdit on Mac).

3.  **Put the Key in the Hiding Spot:**
    *   Inside that blank `.env` file, type the following. **Do not add any extra spaces.**
        ```
        API_KEY=PASTE_YOUR_SUPER_SECRET_KEY_HERE
        ```
    *   Now, replace the text `PASTE_YOUR_SUPER_SECRET_KEY_HERE` with that long, nonsensical key you copied earlier.
    *   The final line should look something like `API_KEY=AizaSy...MORE_RANDOM_STUFF...`
    *   **Save and close the file.** You have successfully hidden the secret password where the app can find it.

### Step 3: Waking the Beast (aka, Running The App)

Now we tell the computer to actually *run* the app.

1.  **A Quick Prerequisite:** You need something called **Node.js**. If you don't have it, the next command won't work. It's like trying to run a fancy kitchen appliance without electricity. Go to [the Node.js website](https://nodejs.org/) and download the "LTS" version for your computer. Install it like any other program (just click "Next" a bunch).

2.  **Go back to your Terminal window.** You should still be "inside" the `caloriequest` folder.

3.  Type this command and press **Enter**:
    ```bash
    npx serve
    ```
    This command tells your computer to start a tiny, personal internet server just for this app. More text will appear. Look for a line that says something like `Listening on: http://localhost:3000`.

4.  **Open your web browser again.** In the address bar at the very top, type `http://localhost:3000` and press **Enter**.

### Step 4: VICTORY! (or... Troubleshooting)

If you see CalorieQuest, congratulations! You did it! You are a certified computer genius. You can now face your nutritional destiny.

**If it didn't work...**
It's almost certainly the API key step. Go back to Step 2 and check these things:
*   Is your secret file *really* named `.env`?
*   Did you save it in the correct `caloriequest` folder?
*   Did you copy the *entire* API key?
*   Does the line in your `.env` file look *exactly* like `API_KEY=YOUR_KEY` with no extra spaces?

If you fix that, try Step 3 again. It'll work this time. We believe in you. Kinda.

## Contributing (You Want to Help? Weird, But Okay.)

Spotted a bug? Got a snarkier piece of copy? Think you can make a button look more... button-y? Feel free to open an issue or a pull request. We're not proud. We'll probably merge it.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingNewThing`)
3.  Commit your Changes (`git commit -m 'Add some AmazingNewThing'`)
4.  Push to the Branch (`git push origin feature/AmazingNewThing`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
Eat responsibly. Commit recklessly.

Basically, do whatever you want with it. Use it, break it, make it better. Just don't sue us if the AI tells you to replace all your meals with kale. You have free will. Probably.
