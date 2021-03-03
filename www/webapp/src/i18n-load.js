import en from "../../../src/locals/en.json";
import it from "../../../src/locals/it.json";
import fr from "../../../src/locals/fr.json";
import ko from "../../../src/locals/ko.json";
import es from "../../../src/locals/es.json";
import de from "../../../src/locals/de.json";
import pl from "../../../src/locals/pl.json";
import nl from "../../../src/locals/nl_NL.json";
import fi from "../../../src/locals/fi.json";
import ru from "../../../src/locals/ru.json";
import zhHans from "../../../src/locals/zh-Hans.json";
import ptPT from "../../../src/locals/pt-pt.json";
import ptBR from "../../../src/locals/pt-br.json";
import nb from "../../../src/locals/nb.json";
import sv from "../../../src/locals/sv.json";
import ro from "../../../src/locals/ro.json";

function walkReverse(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === "string"
        ? val.split("").reverse().join("")
        : walkReverse(val),
    ])
  );
}
const translations = {
  fr,
  en,
  it,
  ko,
  pl,
  es,
  de,
  fi,
  nl,
  ru,
  "zh-Hans": zhHans,
  "pt-PT": ptPT,
  "pt-BR": ptBR,
  nb,
  sv,
  ro,
  // testing with an obviously-transformed language makes it easy to find and
  // remove hardcoded strings. Hidden behind `feature.testLocalesVisible`.
  _test: walkReverse(en),
}
export default {translations, defaultLocale: "en"};
