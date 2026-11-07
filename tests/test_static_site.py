from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.assets = []
        self.forms = 0
        self.buttons = []
        self.aria_labels = []
        self.text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if "id" in attributes:
            self.ids.add(attributes["id"])
        if tag == "a":
            self.links.append(attributes)
        if tag == "script" and attributes.get("src"):
            self.assets.append(attributes["src"])
        if tag == "link" and attributes.get("rel") in {"stylesheet", "icon"}:
            self.assets.append(attributes.get("href", ""))
        if tag == "form":
            self.forms += 1
        if tag == "button":
            self.buttons.append(attributes)
        if "aria-label" in attributes:
            self.aria_labels.append(attributes)

    def handle_data(self, data):
        self.text.append(data)


class PortfolioStaticSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text(encoding="utf-8")
        cls.css = (ROOT / "assets/css/styles.css").read_text(encoding="utf-8")
        cls.app_js = (ROOT / "assets/js/app.js").read_text(encoding="utf-8")
        cls.dockerfile = (ROOT / "Dockerfile").read_text(encoding="utf-8")
        cls.readme = (ROOT / "README.md").read_text(encoding="utf-8")
        cls.privacy_html = (ROOT / "privacidade.html").read_text(encoding="utf-8")
        cls.parser = PageParser()
        cls.parser.feed(cls.html)
        cls.privacy_parser = PageParser()
        cls.privacy_parser.feed(cls.privacy_html)
        cls.visible_text = " ".join(cls.parser.text)
        cls.privacy_visible_text = " ".join(cls.privacy_parser.text)

    def test_profile_avoids_unverified_skill_ratings_and_project_counts(self):
        self.assertIn("Engenheiro de Software", self.html)
        self.assertNotRegex(self.html, r"\b\d{1,3}%")
        self.assertNotIn("6+", self.html)
        self.assertNotIn("10+", self.html)
        self.assertNotIn("Técnico N2 – Montreal Informática", self.html)

    def test_resume_download_points_to_an_existing_local_file(self):
        downloads = [link for link in self.parser.links if "download" in link]
        self.assertEqual(len(downloads), 1)
        resume_path = ROOT / downloads[0]["href"]
        self.assertTrue(resume_path.is_file(), f"Missing resume asset: {resume_path.name}")

    def test_page_assets_are_local_and_do_not_load_third_party_code(self):
        remote_assets = [asset for asset in self.parser.assets if asset.startswith(("http://", "https://"))]
        self.assertEqual(remote_assets, [])

    def test_navigation_is_available_without_javascript_at_mobile_widths(self):
        local_targets = {
            link["href"][1:]
            for link in self.parser.links
            if link.get("href", "").startswith("#") and len(link["href"]) > 1
        }
        self.assertTrue(local_targets.issubset(self.parser.ids))
        self.assertNotIn('id="menu-toggle"', self.html)
        mobile_start = self.css.index("@media (max-width: 720px)")
        mobile_end = self.css.index("@media (max-width: 520px)", mobile_start)
        mobile_css = self.css[mobile_start:mobile_end]
        main_nav_rule = re.search(r"\.main-nav\s*\{([^}]*)\}", mobile_css)
        self.assertIsNotNone(main_nav_rule)
        assert main_nav_rule is not None
        self.assertIn("display: flex", main_nav_rule.group(1))
        self.assertIn("overflow-x: auto", main_nav_rule.group(1))
        self.assertIn("prefers-reduced-motion", self.css)

    def test_static_screen_reader_labels_are_localized(self):
        labels = self.parser.aria_labels + self.privacy_parser.aria_labels
        static_labels = [
            label for label in labels
            if label.get("id") not in {"language-toggle", "theme-toggle"}
        ]
        self.assertTrue(static_labels)
        for label in static_labels:
            self.assertIn("data-aria-pt", label)
            self.assertIn("data-aria-en", label)
        self.assertIn('querySelectorAll("[data-aria-pt][data-aria-en]")', self.app_js)
        self.assertIn('activeLanguage === "pt" ? "Tema escuro" : "Dark theme"', self.app_js)
        self.assertNotIn("Switch to light theme", self.app_js)
        self.assertNotIn("Switch to dark theme", self.app_js)
        self.assertIn('setAttribute("aria-pressed", String(isDark))', self.app_js)
        self.assertIn("data-alt-pt", self.html)
        self.assertIn("[data-alt-pt][data-alt-en]", self.app_js)

    def test_color_tokens_meet_accessible_contrast_thresholds(self):
        light_match = re.search(r":root\s*\{([^}]*)\}", self.css)
        dark_match = re.search(r':root\[data-theme="dark"\]\s*\{([^}]*)\}', self.css)
        self.assertIsNotNone(light_match)
        self.assertIsNotNone(dark_match)
        assert light_match is not None and dark_match is not None

        def variables(block):
            return dict(re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{6})", block))

        def contrast(first, second):
            def luminance(color):
                channels = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
                linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in channels]
                return sum(weight * value for weight, value in zip((0.2126, 0.7152, 0.0722), linear))

            high, low = sorted((luminance(first), luminance(second)), reverse=True)
            return (high + 0.05) / (low + 0.05)

        light = variables(light_match.group(1))
        dark = variables(dark_match.group(1))
        white = "#ffffff"
        for theme, tokens in (("light", light), ("dark", dark)):
            with self.subTest(theme=theme):
                self.assertGreaterEqual(contrast(tokens["--accent-fill"], white), 4.5)
                self.assertGreaterEqual(contrast(tokens["--accent-fill-hover"], white), 4.5)
                for background in (tokens["--accent"], tokens["--cyan"]):
                    self.assertGreaterEqual(contrast(tokens["--brand-mark-text"], background), 4.5)
        self.assertGreaterEqual(contrast(light["--cyan"], light["--page"]), 4.5)
        self.assertGreaterEqual(contrast(light["--focus"], light["--page"]), 3.0)
        self.assertGreaterEqual(contrast(dark["--focus"], dark["--page"]), 3.0)

    def test_contact_panel_text_and_focus_contrast_over_its_gradient(self):
        def rule(selector):
            match = re.search(re.escape(selector) + r"\s*\{([^}]*)\}", self.css)
            self.assertIsNotNone(match)
            assert match is not None
            return match.group(1)

        panel = rule(".contact-panel")
        gradient = re.search(r"linear-gradient\(([^)]*)\)", panel)
        self.assertIsNotNone(gradient)
        assert gradient is not None
        stops = re.findall(r"#[0-9a-fA-F]{6}", gradient.group(1))
        self.assertGreaterEqual(len(stops), 2)

        def declaration(selector, property_name):
            match = re.search(rf"{property_name}:\s*(#[0-9a-fA-F]{{6}})", rule(selector))
            self.assertIsNotNone(match)
            assert match is not None
            return match.group(1)

        def contrast(first, second):
            def luminance(color):
                channels = [int(color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
                linear = [value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4 for value in channels]
                return sum(weight * value for weight, value in zip((0.2126, 0.7152, 0.0722), linear))

            high, low = sorted((luminance(first), luminance(second)), reverse=True)
            return (high + 0.05) / (low + 0.05)

        text_colors = (
            declaration(".contact-panel .eyebrow", "color"),
            declaration(".contact-panel p:not(.eyebrow)", "color"),
        )
        focus_color = declaration(".contact-panel :focus-visible", "outline-color")
        for background in stops:
            for foreground in text_colors:
                self.assertGreaterEqual(contrast(foreground, background), 4.5)
            self.assertGreaterEqual(contrast(focus_color, background), 3.0)

    def test_container_includes_privacy_page_and_preview_is_loopback_only(self):
        self.assertRegex(
            self.dockerfile,
            r"(?m)^COPY privacidade\.html /usr/share/nginx/html/privacidade\.html$",
        )
        self.assertIn("curl -fsS http://127.0.0.1:8080/health", self.dockerfile)
        self.assertIn("python3 -m http.server 8000 --bind 127.0.0.1", self.readme)
        self.assertIn("-p 127.0.0.1:8080:8080", self.readme)

    def test_no_visitor_data_form_or_tracking_is_added(self):
        self.assertEqual(self.parser.forms, 0)
        self.assertNotIn("google-analytics", self.html.lower())
        self.assertNotIn("gtag(", self.html.lower())

    def test_privacy_note_explains_local_preferences(self):
        normalized = self.visible_text.casefold()
        self.assertIn("preferências", normalized)
        self.assertIn("navegador", normalized)

    def test_privacy_requests_cover_site_data_and_local_preferences(self):
        normalized = self.privacy_visible_text.casefold()
        self.assertIn("solicitações relacionadas a este portfólio", normalized)
        self.assertIn("registros técnicos de acesso", normalized)
        self.assertIn("limpando os dados deste site", normalized)
        self.assertIn("cookies", normalized)
        self.assertIn("cliente de e-mail", normalized)

    def test_privacy_page_exists_and_is_linked(self):
        self.assertIn('href="privacidade.html"', self.html)
        self.assertTrue((ROOT / "privacidade.html").is_file())

    def test_local_image_asset_exists(self):
        self.assertTrue((ROOT / "img/foto.jpg").is_file())


if __name__ == "__main__":
    unittest.main()
