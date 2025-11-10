# CalorieQuest
**Because counting calories shouldn’t feel like filing your taxes.** 

A modern, AI-powered nutrition tracker that lets you log meals, talk to an AI that won’t judge you for eating pizza three days in a row (probably), and generally get your life together. Or at least, your diet.**

<img width="1021" height="928" alt="image" src="https://github.com/user-attachments/assets/760af2b6-2d03-4b4b-8efe-f907236824e3" />


---

So, you've decided to confront the nutritional reality of your life choices. Brave. Most people just close their eyes and hope for the best. CalorieQuest is for the courageous, the curious, and those who suspect their "healthy" salad might be a caloric Trojan horse.

This isn't your grandma's calorie counter. We use the all-powerful, slightly-scary magic of the Gemini AI to make logging food less of a chore and more of a... well, a slightly less tedious chore.

## Features (aka, How We Help You Face the Music) 🎵

*   **🤖 AI-Powered Confessional:** Too lazy to type? Just describe your meal like you're telling a story (`"a tragic tale of a bagel that met a schmear of cream cheese"`) or upload photo evidence of your culinary crime. Our AI will analyze it and log the nutritional stats. It’s like having a food detective on call.

*   **📚 The Culinary Archives:** Search our vast food database to find the nutritional breakdown of pretty much anything. Finally, you can know for sure how much damage that questionable street taco did.

*   **🗓️ Pretend You Have a Plan:** Use the Meal Planner to map out your week of perfect eating before you inevitably deviate for emergency donuts. You can even generate a full day's meal plan with a single click. We won't tell anyone you didn't come up with it yourself.

*   **💬 Consult the Oracle:** Our AI Chatbot knows a disturbing amount about nutrition. Ask it for recipe ideas, fitness tips, or why you crave cheese at 3 AM. It’s here to help, not to judge. Mostly.

*   **🎯 Goal Setting for Procrastinators:** Set your daily targets for calories, macros, and hydration. You can change them later when no one’s looking. We even have a "Weekly Balancing" feature that will passive-gressively adjust your future goals if you overdo it. No escape.

*   **🔗 Show Off (or Shame Yourself):** Generate a shareable, read-only link to your daily summary. Perfect for nutritionists, personal trainers, or friends who need proof that you *do* occasionally eat a vegetable.

## The Tech Stack (The Stuff That Makes the Magic Happen) ✨

Forged in the fires of modern web development and powered by an AI that's probably smarter than we are.

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **The Brains:** Google Gemini API
*   **Vibes:** Sarcasm, caffeine, and a healthy dose of reality.

## Getting Started (Or, "How to Run This Thing") 🚀

Look, it's a pretty standard React app. If you can't figure this out, maybe calorie counting isn't your biggest problem right now.

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/mkowalik-git/CalorieQuest.git
    cd caloriequest
    ```

2.  **Environment Setup:**
    This project talks to the Google Gemini API, and it's not doing it with good vibes alone. You need an API key.

    *   You'll need to make sure `process.env.API_KEY` is available in your environment. How you do this is your business. A `.env` file, a hosting provider's secret manager, whispering it to your computer—whatever works.

3.  **Serve it:**
    It's a static site. You can use any simple server.
    ```bash
    # If you have node/npm
    npx serve
    ```
    Now open your browser and face your nutritional destiny. If it doesn't work, you probably messed up the API key part. Or you broke something else. We're betting on the key.

## Contributing (You Want to Help? Weird, But Okay.)

Spotted a bug? Got a snarkier piece of copy? Think you can make a button look more... button-y? Feel free to open an issue or a pull request. We're not proud. We'll probably merge it.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingNewThing`)
3.  Commit your Changes (`git commit -m 'Add some AmazingNewThing'`)
4.  Push to the Branch (`git push origin feature/AmazingNewThing`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
Eat responsibly. Coommit recklessly.

Basically, do whatever you want with it. Use it, break it, make it better. Just don't sue us if the AI tells you to replace all your meals with kale. You have free will. Probably.
