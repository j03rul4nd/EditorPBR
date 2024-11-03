# PBR Texture Editor and Viewer

![App Screenshot](https://editorpbr.vercel.app/HERO_BBR_TEXTURES.png)

## Description
**PBR Texture Editor and Viewer** is a web application that enables users to edit and visualize Physically-Based Rendering (PBR) textures in real-time on a 3D model. This tool is designed to streamline the process of reviewing and adjusting textures without the need for complex 3D software like Blender.
![App Screenshot](https://editorpbr.vercel.app/cover.JPG)

## Features
- **Real-Time 3D Preview**: Visualize texture changes instantly on a 3D model.
- **PBR Texture Editing**: Edit essential PBR maps, including:
  - **Albedo**: Adjust base color and saturation.
  - **Normal**: Modify intensity and invert axes for better surface detail.
  - **Roughness**: Control surface reflectivity.
  - **Metalness**: Adjust the metal-like properties of the surface.
  - **Occlusion**: Enhance shading and depth perception.
  - **Displacement**: Modify height/displacement effects for realistic surface textures.
- **Texture Import and Export**: Load custom textures and save your work.
- **Texture Pack Selector**: Quickly apply pre-set textures for various materials.

## Technologies Used
- **Frontend**: HTML, CSS, JavaScript
- **3D Rendering**: WebGL (via frameworks/libraries like `Three.js` if applicable)
- **UI Components**: dat.GUI for user controls and editing

## Demo
Check out the live demo [here](https://editorpbr.vercel.app/).

## How to Use
1. **Upload Your Textures**: Use the load buttons to import textures for Albedo, Normal, Roughness, Metalness, Occlusion, and Displacement maps.
2. **Edit Textures**: Modify properties using the provided sliders and color pickers.
3. **Preview in 3D**: See real-time updates on the 3D model.
4. **Save Your Work**: Export your edited textures for further use in 3D projects.

## Installation
To run this project locally, follow these steps:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/j03rul4nd/EditorPBR.git
    ```

2. **Navigate to the project directory**:
    ```bash
    cd pbr-texture-editor
    ```

3. **Install dependencies**:
   Ensure you have [Node.js](https://nodejs.org/) installed. Run the following command to install the necessary packages:
    ```bash
    npm install
    ```

4. **Start the development server**:
    Launch the application using Vite's development server:
    ```bash
    npm run dev
    ```

5. **Open in your browser**:
   After running the development server, you should see a local address, typically `http://localhost:5173/`, where you can access the app. Open this URL in your preferred web browser.

## File Structure
 ```bash
pbr-texture-editor/
│
├── index.html           # Main HTML structure
├── style.css            # Custom styles
├── main.js              # Core JavaScript logic for texture handling
├── dat.gui.js           # External library for UI controls
├── assets/              # Folder for storing icons and images
│   ├── icon_bggenerator.png
│   └── HERO_BBR_TEXTURES.png
└── README.md            # Project documentation
```
## Accessibility
The app is designed with accessibility in mind:
- ARIA labels and roles ensure screen reader compatibility.
- Responsive design adapts to various screen sizes for better user experience.

## SEO Optimization
This project includes essential meta tags for SEO, such as:
- **Description**: For search engine visibility.
- **Open Graph Protocol**: Enhanced social media previews.
- **Twitter Card**: Customized card for Twitter sharing.

## License
This project is licensed under the [MIT License](LICENSE).

## Author
**Joel Benitez**
- [Portfolio](https://joelbenitez.onrender.com/)
- [LinkedIn](https://www.linkedin.com/in/joel-benitez-iiot-industry/)

## Contribution
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/j03rul4nd/EditorPBR/issues) if you want to contribute.

## Acknowledgements
- Icons by [FontAwesome](https://fontawesome.com/)
- UI components by [dat.GUI](https://github.com/dataarts/dat.gui)

---

Thank you for checking out **PBR Texture Editor and Viewer**! Enjoy seamless texture editing and visualization directly in your browser.
