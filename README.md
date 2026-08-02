# N.O.V.A — Local Desktop AI Assistant

N.O.V.A is a locally powered desktop AI assistant built for Windows.

It combines local artificial intelligence, voice interaction, persistent conversations, controlled long-term memory, desktop utilities, browser automation, and a custom animated interface.

> This repository is a public project showcase.  
> The complete implementation is maintained in a private repository.

## Demo

A demonstration video will be added here.

## Interface

Screenshots will be added here.

## Core Features

### Local AI

- Runs locally through Ollama
- Uses Qwen for normal conversations
- Supports multiple response modes through a model registry
- Preserves conversation history
- Operates without a cloud AI provider for ordinary chat

### Voice Interaction

- Wake-word activation using “NOVA”
- Speech recognition
- Local Kokoro text-to-speech
- Spoken timer and reminder alerts
- Protection against N.O.V.A responding to its own audio

### Memory System

- SQLite-based structured memory
- Obsidian-powered `NOVA Brain`
- Temporary conversation context
- Confirmed long-term memory
- Confirmation before saving sensitive personal information

### Desktop and Utility Tools

N.O.V.A can:

- Tell the current time, date, and day
- Perform arithmetic and percentage calculations
- Detect incomplete spoken calculations
- Retrieve current weather by location
- Search the web
- Open websites
- Open supported applications
- Search and play content on YouTube
- Open folders
- Search project files
- Check CPU usage
- Check RAM usage
- Check disk storage
- Check battery and charging status
- Create timers
- Create reminders
- List and cancel active timers and reminders

## Technology Stack

### Frontend

- React
- Vite
- React Three Fiber
- Web Speech API
- Custom GLSL shaders

### Backend

- Python
- FastAPI
- SQLite
- Ollama
- Qwen
- Kokoro
- Open-Meteo
- psutil
- Playwright

## High-Level Architecture

```text
User
 │
 ├── Voice / Wake Word
 └── Text Input
        │
        ▼
React Interface
        │
        ▼
FastAPI Backend
        │
        ├── Tool Router
        │     ├── Calculator
        │     ├── Weather
        │     ├── System Status
        │     ├── Timers and Reminders
        │     ├── Browser Automation
        │     └── Desktop Utilities
        │
        ├── Memory Service
        │     ├── SQLite
        │     └── NOVA Brain
        │
        ├── Local Qwen Model
        │
        └── Kokoro Voice
```

## Engineering Highlights

### Fast Direct Tool Routing

Utility commands bypass the language model entirely.

Examples include:

- Time and date
- Calculator
- Computer status
- Timers
- Reminders

This reduces response time and avoids unnecessary model inference.

### Safe Memory Handling

N.O.V.A separates:

- Temporary conversation context
- Confirmed long-term memory
- Personal knowledge stored in the Obsidian brain

Sensitive personal details require confirmation before being saved.

### Voice Echo Protection

Timer and reminder alerts may be heard by the microphone. N.O.V.A detects probable self-generated alert speech and prevents it from triggering another AI response.

### One-Click Startup

A Windows launcher:

1. Checks Ollama
2. Starts required services
3. Starts the FastAPI backend
4. Warms the local language model and voice engine
5. Starts the React frontend
6. Opens the interface

## Current MVP Limitations

- Timers and reminders exist only while the backend is running
- Weather and web search require an internet connection
- Speech recognition can occasionally mishear commands
- Web search opens results but does not yet summarize webpages
- Application launching uses a configured application list
- The current version runs through a browser interface
- The complete source code is private

## Planned Development

Potential future improvements include:

- Packaged Windows desktop application
- Persistent reminders
- Streaming AI responses
- Faster sentence-by-sentence speech
- Live webpage reading and summarization
- Calendar and email integration
- Semantic memory search
- More desktop controls
- Multi-step autonomous workflows

## Project Status

N.O.V.A MVP v1 is functionally complete.

The current version includes:

- Local AI conversation
- Wake-word activation
- Voice input and output
- Conversation persistence
- Confirmed long-term memory
- Obsidian knowledge integration
- Browser and desktop tools
- Weather
- Calculator
- System monitoring
- Timers and reminders
- One-click startup

## Ownership

Copyright © 2026 Ajmal Shan. All rights reserved.

N.O.V.A is a proprietary personal project. Its complete source code, architecture, branding, interface, prompts, documentation, and implementation may not be copied, modified, redistributed, or used commercially without written permission.
