import { register_a_progress } from "./a-progress";
import { register_a_text } from "./a-text";
import { register_a_icon } from "./a-icon";
import { register_a_sticker } from "./a-sticker";
import { register_a_sticker_animated } from "./a-sticker-animated";
import "./a-progress.css";
import "./a-text.css";
import "./a-title.css";
import "./a-icon.css";
import "./a-icon.shapes.css";
import "./a-sticker.css";
import "./a-sticker-animated.css";

export { AProgressElement, register_a_progress } from "./a-progress";
export { ATextElement, register_a_text } from "./a-text";
export { AIconElement, register_a_icon } from "./a-icon";
export { AStickerElement, register_a_sticker } from "./a-sticker";
export {
  AStickerAnimatedElement,
  register_a_sticker_animated,
} from "./a-sticker-animated";

// typeof guard: direct reference to undeclared variable throws ReferenceError, typeof does not
if (typeof customElements !== "undefined") {
  register_a_progress();
  register_a_text();
  register_a_icon();
  register_a_sticker();
  register_a_sticker_animated();
}
