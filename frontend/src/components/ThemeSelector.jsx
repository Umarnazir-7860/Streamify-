import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { PaletteIcon } from "lucide-react";
const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  return (
    <div className="dropdown dropdown-end mr-5">
      {/* Dropdowm trigger  */}
      <button tabIndex={0} className="btn btn-ghost btn-circle">
        <PaletteIcon className="size-5" />
      </button>
      <div
        tabIndex={0}
        className="dropdown-content mt-2 p-1 shadow-2xl  bg-base-200 backdrop-blur-lg 
    rounded-2xl w-56 border border-base-content/10  max-h-80 overflow-y-auto"
      >
     <div className="space-y-1 ">
  {THEMES.map((themeOption) => (
    <button
      key={themeOption.name}  // <-- fixed here
      className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors
       ${
         theme === themeOption.name
           ? "bg-primary text-primary-content"
           : "hover:bg-base-300 text-base-content"
       }
       `}
      onClick={() => setTheme(themeOption.name)}
    >
      <PaletteIcon className="size-4" />
      <span className="font-medium ">{themeOption.label}</span>
      {/* Theme Preview Colors */}
      <div className="ml-auto flex gap-1">
        {themeOption.colors.map((color, i) => (
          <span
            key={i}
            className="size-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </button>
  ))}
</div>

      </div>
    </div>
  );
};

export default ThemeSelector;
