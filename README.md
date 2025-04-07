# Summary
[Boot.Rocks](https://boot.rocks) is an unsponsored product review using interactive video, social media, and a dedicated website about the educational platform [Boot.Dev](https://boot.dev), that teaches software engineering. 

It applied my triforce of marketing, engineering, and media skills, while providing value to Boot.dev and prospective students. Secondly, it showed I clearly understood their product benefits and demonstrated my capabilities as a potential employee.

The review has 10 sections including: an introduction, 8 reasons why "Boot Rocks", and a summary. Section clips were made with subtitles and an AI-generated video outro featuring a female adventurer, a call-to-action to visit tracked links, and a soundtrack. People could then visit the campaign website at Boot.Rocks to see the full video, accompanying text, and navigate around. Analytics were used for both social links and website traffic.

The campaign launched on multiple social media sites over a few weeks with a new clip posted every other day, Monday to Friday, with custom messaging, mentions, and tags as appropriate.

# Features
- 7 minute video product review
- 10 video clips with AI-generated outro CTAs
- Campaign website with section navigation
- Link and site traffic analytics

# Design / Tech
Code: HTML, CSS, JavaScript
Libs: Vite, Vimeo, Tailwind
Design: Photoshop
Video: DaVinci Resolve (editing), Kapwing (subtitles)
Sound: Audacity
Deployment: GitHub Actions and Pages
IDE: Cursor with Claude

# Process
## Concept
As a marketing engineer, I've always been interested in product reviews and infomercials. However, these are typically never combined. Reviews are independent and short, whereas infomercials are sponsored and long.

What if I could combine both formats while still being independent?
Could the project be:
- A fun, engaging, and informative product review
- With a dedicated website with clear call-to-actions
- Use both video and text content for accessibility and SEO
- Structured, allowing full sections to be shared on social media
- Navigable like a YouTube video with sections
- But better polished in terms of design
- Excellent mobile UX
- Have a content carousel below the video with transcript and links
- Adaptable for other creative uses

When comparing Boot.dev to other interactive tech education platforms, it is superior in every regard. I only see many opportunities for them to better serve developers of all skill levels with various supplementary products. This sincere belief allowed me to put my name behind it.

Secondly, as a portfolio project it would refresh my video production skills after a 15 year break since last creating 172 videos for a business media company.

Lastly, I was looking to join a great brand team. Boot Rocks would provide them distinct value before submitting an open-ended application, while showing my:
- Understanding of their product benefits
- Triforce of marketing, engineering, and media skills

## Script
Since I had joined their platform as a paid member in November 2024, I was already familiar with the product benefits. Following 2 weeks of writing, 8 sections emerged:
- Introduction
- Complete Trade School
- Great Deal
- Fun
- Great Teachers
- Rich Media
- Educational Engineering
- Community
- Strong Customer Focus
- Summary

## Studio Setup
I used my office shown in the image here. Equipment included:
- Rode PodMic USB on low-profile arm
- Sony RX100 VIII camera mounted on telescope pole with teleprompter
- 1080p, 24fps, 1/50 shutter speed
- Live captured with OBS Studio
- 4000K CCT on camera/lights
- Ulanzi 40W LED key light with softbox
- Lights: 1 fill, 4 CCT practicals, 2 color practicals

## Production
Each section was filmed in multiple takes, reviewed, and edited in DaVinci Resolve. The complete video timeline was 16:9 AR. Ten separate timelines for social media clips had a 4:3 AR with additional padding for subtitles. Media assets were sourced from Boot.dev, YouTube, Google Images, and Giphy. Original graphics were created in Photoshop using Badger Pro font. AI outro videos were created using Midjourney and a variety of image-to-video tools including Hailuo.

Primary music was from the film "The Goonies", with the Community section from "Lord of the Rings". Outro music was mostly from various soundtracks including "Star Trek II: The Wrath of Khan", "The Illusionist", "Tales from the Crypt", and "The Silence of the Lambs". Clips were cut in Audacity, with selective volume adjustments for dramatic effect and transitions.

Subtitles were added and edited for social media clips using [Kapwing](https://www.kapwing.com/tools/auto-subtitle-video).

## Website
The site was iteratively built using Cursor Pro with AI assistance as a single dictated dialogue. I wrote most HTML and CSS, while AI created all the JavaScript. The critical assistance needed was for the video display (Vimeo SDK), navigation, and showing/hiding section content. A mobile-first design approach was used with 7 screen-width breakpoints.

CSS was nested and custom properties often used. While Tailwind was mostly used in the beginning, most styles moved to CSS since UI components weren't feasible when building 2 pages with static content and vanilla JS. UI was tested with Chrome DevTools and Sizzy emulator. Local commits were continuously, while Vite was used for development and production builds.

## Deployment
The video was hosted using a Vimeo Pro account, using their player SDK for integration. The site is deployed using GitHub Actions and Pages with the following workflow:
1. Triggers on every push to the `main` branch
2. Sets up Node.js, installs dependencies, and builds the project
3. Deploys built files to GitHub Pages using the `peaceiris/actions-gh-pages` action

## Analytics
[Dub.co](https://dub.co): creating and tracking inbound links from social media posts to the Boot Rocks website, Boot.dev (website, podcast, YouTube), my (Mario Vellandi) website, and the project information page in my portfolio.

[Plausible Analytics](https://plausible.io): tracking website traffic including page views, unique visitors, and referral sources. Added as a script to the HTML head.

The campaign launched on multiple social platforms on a staggered schedule. This included at least 10 posts for each video section with corresponding content. The end of each video includes a call-to-action "Reason #X and 7 others at the link above", tied to tracking links. Post hashtags were used as space allowed.