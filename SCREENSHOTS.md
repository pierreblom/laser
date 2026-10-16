# MKSLaser screenshots: workflow and browser implementation

These 14 screenshots show the phone app's creation flow for the Laservii L1 Pro. They are visual references for Laser Link, not commands or proof that the machine accepts a particular job setting. The phone's sample artwork is a dragon design; the original artwork file was not supplied, so Laser Link does not bundle or recreate it.

| Image | What it shows | Laser Link on localhost |
| --- | --- | --- |
| 14 | Home with **Connect**, **Creation**, **Control**, and **Recent projects**. | The browser has **Create a design**, **Connect & send**, **Control**, and **Projects** views. A recent-project strip appears under the editor. Designs autosave locally in Chrome; `.laserlink.json` provides a portable backup. |
| 12, 5 | A 300 × 300 mm creation grid, artwork placement, top actions, and the **Picture / Text / Material / Draw / Code** tool row. | The design workspace has a 300 × 300 mm grid with lower-left origin. It supports multiple objects, drag positioning, exact location and size, undo/redo, and the five tool groups. |
| 6 | Picture sources: **Album**, **Graving**, **Camera**. | **Import picture** reads an SVG, PNG, JPEG, WebP, or GIF selected from the Mac. SVGs are converted to pixels on import. A phone gallery, cloud Graving library, and live camera are not connected. |
| 11, 13 | Selecting artwork, then editing **Size, Location, Rotate, Horizontal, Vertical**. | Select an object on the grid; edit X/Y/width/height/rotation numerically, flip it horizontally or vertically, or drag it. |
| 9 | Picture filters: **Original, Gray, Strong, Sketch, dither**. | All five filter choices are available for selected images. They affect the local raster preview and generated G-code. |
| 10 | Brightness and contrast sliders. | Both are available for selected images. The screenshot happens to show 100% brightness and 80% contrast; these are not imposed as defaults. |
| 7 | Cropping the dragon image. | The four crop-edge fields trim an image by percentage. |
| 8 | Rectangle, circular, triangle, star, and heart masks. | The same five mask shapes are available for images. |
| 4, 2 | **Code** opens QR creation with Text, URL, Wi-Fi, and Business card content. | The Code tool generates a QR bitmap with a four-module white border and places it on the bed. |
| 3 | Barcode creation with CODE128, EAN13, UPC, ITF14. | The Code tool generates and places these four barcode formats. Invalid values are rejected by the barcode library. |
| 1 | Parameter settings and **Upload / Frame**. It displays `DLC32001.nc`, 5% laser power, 1000 mm/min, one engraving, 5% frame power, air assist on, M4. | **Next: settings** exposes file name, power, speed, passes, frame power, air assist, M4, raster resolution, and maximum S. **Download .nc** exports a job; **Prepare to send** moves it to the Bluetooth sender. **Preview frame** draws bounds on-screen only. The screenshot values are initial examples; air assist defaults off because the hardware is optional. |

## Job generation and controller checks

The browser converts the finished workspace to black-and-white raster lines at 0.2, 0.3, or 0.4 mm per pixel. It emits millimetre (`G21`), absolute (`G90`), dynamic-power laser (`M4`) G-code, with `G0` travel and `G1` engraving runs. Power percent is converted to an `S` value using the configured `$30` maximum. It rejects empty designs, artwork outside the 300 × 300 mm bed, and jobs over 20 MB.

When connected, the sender reads GRBL status and settings. A browser-generated job can start only after it has verified the device is idle, `$32=1`, `$30` matches the generated S scale, and the job bounds fit the reported travel. A user confirmation is required before machine motion. Existing external G-code files can still be loaded, but are not generated or geometrically checked by this editor.

The phone screenshots do not reveal the exact MKSLaser file transfer protocol, origin convention, image conversion algorithm, material-specific power, or whether the air assist pump is wired to this controller. Laser Link uses its independently verified Bluetooth UART and GRBL command path. Test a small design on scrap material and verify focus, placement, and machine response before a full engraving.

## Additional screenshots

The four later screenshots add project management, manual control, and app preferences:

| Screen | What it shows | Laser Link on localhost |
| --- | --- | --- |
| Manage project | A two-column thumbnail gallery and **Select** action. | **Projects** shows locally autosaved thumbnails. **Select** enables deletion of chosen projects; opening a card restores its editable design. |
| Control | X/Y position, 1/10/50 mm steps, Slow/Medium/Fast speeds, directional movement, Home, Light, Locate, and Cool. | **Control** reads live GRBL position and offers guarded manual jog with those step and speed choices. Jog and switch homing were verified on the machine on 13 October 2026. Jig alignment, measurement, and physical low-power framing have been added but have not yet been tested on the machine. Light, Locate, and Cool remain disabled. |
| Mine | Language, legal pages, cache, version, BLE mode Feasycom, canvas 300 × 300 mm, and millimetres. | Device details show the applicable BLE mode, canvas, and unit. Language/legal/cache items belong to the phone app and are not copied into this localhost tool. |
| Home | Connect, Creation, Control, recent projects, and Manage project. | The navigation and recent gallery provide the same entry points. The promotional laser photograph is not reused because it does not establish this machine's appearance. |
