# 🚀 Context-Aware Predictive Keyboard

This project is an implementation of a smart keyboard system designed to improve typing efficiency and accuracy. The system focuses on two core functionalities: **autocorrection** and **next-word prediction**.

The goal is to create an intuitive keyboard that leverages the contextual information of preceding words to anticipate user input, facilitating a faster and error-free text entry experience.

## ✨ Key Features

* **Autocorrection:** Corrects common spelling mistakes and typos in real-time.
* **Next-Word Prediction:** Suggests the most probable next word(s) based on the current sentence context.
* **Context-Aware:** The prediction engine analyzes the sequence of preceding words, not just the single last word, to provide more relevant suggestions.

## 🧠 Methodology & Core Concepts

To achieve accurate prediction, this project explores two primary language modeling techniques. The system is designed to be modular, allowing for the implementation and comparison of either (or both) of these approaches.

### 1. N-gram Language Models

This is a statistical approach that models the probability of a word occurring given a sequence of previous words.

* **What is it?** An $n$-gram is a contiguous sequence of $n$ items (words) from a given text.
    * **Bigram (2-gram):** "I **am**"
    * **Trigram (3-gram):** "I am **happy**"
    * **4-gram:** "I am happy **to**"
* **How it works:** The model calculates the probability of a word $w_n$ given the $N-1$ previous words:
    $P(w_n | w_{n-N+1}, ..., w_{n-1})$
* **Implementation:**
    1.  **Training:** The model is trained on a large corpus of text (e.g., news articles, books, or chat logs). It counts the frequency of all $n$-grams.
    2.  **Prediction:** When the user types a sequence of words, the model queries its database for the $n-1$ gram that matches the end of the user's sequence. It then suggests the words that have the highest probability of following that sequence.
* **Pros:** Simpler to implement, computationally faster, and works well for common phrases.
* **Cons:** Struggles with long-range context (e.g., in a trigram model, it only ever "sees" the last two words) and unseen $n$-grams (the "zero-frequency" problem).

### 2. Recurrent Neural Networks (RNNs)

This is a deep learning approach that uses neural networks designed to handle sequential data.

* **What is it?** An RNN is a type of neural network that maintains an internal "memory" or **hidden state**. This state captures information about all the preceding elements in a sequence, allowing it to "remember" context from far earlier in the sentence.
* **How it works:**
    1.  **Word Embeddings:** Words are first converted into dense vector representations (embeddings) that capture semantic meaning.
    2.  **Sequential Processing:** As the user types, each word's embedding is fed into the RNN. The network updates its hidden state to reflect the new word in the context of the previous state.
    3.  **Prediction:** The final hidden state is fed through a prediction layer (a "softmax" layer) which outputs a probability distribution over the entire vocabulary, indicating the most likely next words.
* **Variants:** Standard RNNs suffer from vanishing gradient problems. This project will likely use more advanced architectures:
    * **LSTM (Long Short-Term Memory):** Uses a system of "gates" (input, forget, output) to control what information is stored, updated, or discarded from its memory. This makes it excellent at capturing long-range dependencies.
    * **GRU (Gated Recurrent Unit):** A simplified version of LSTM that is computationally more efficient but often just as effective.
* **Pros:** Can capture complex patterns and long-range context, leading to more accurate and nuanced predictions.
* **Cons:** Requires a large dataset and significant computational power for training; can be slower for real-time inference if not properly optimized.

---

## 🎯 Project Goals

The primary objective is to create a functional and intuitive keyboard that demonstrably improves the user experience. Success will be measured by:

1.  **Accuracy:** The percentage of times the correct word appears in the top 3 suggestions.
2.  **Efficiency:** The ability to reduce the total number of keystrokes required by the user.
3.  **Performance:** The latency between a keystroke and the appearance of suggestions (must be near-instantaneous for a good UX).
4.  **Intuition:** The "feel" of the keyboard—suggestions should feel relevant, natural, and non
