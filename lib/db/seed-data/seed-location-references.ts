/**
 * Seeds location_references linking locations to specific Bible verses.
 * Uses book name + chapter to create references via the books/chapters tables.
 */

import { eq, and } from "drizzle-orm";
import { seedDb as db } from "../seed-connection";
import { locationReferences, books, chapters } from "../schema";

interface LocationRef {
  locationName: string;
  bookName: string;
  chapterNumber: number;
}

/**
 * Key scripture references for major biblical locations.
 */
const LOCATION_REFS: LocationRef[] = [
  // ─── Genesis ─────────────────────────────────────────────
  { locationName: "Euphrates River", bookName: "Genesis", chapterNumber: 2 },
  { locationName: "Tigris River", bookName: "Genesis", chapterNumber: 2 },
  { locationName: "Mesopotamia", bookName: "Genesis", chapterNumber: 2 },
  { locationName: "Mount Ararat", bookName: "Genesis", chapterNumber: 8 },
  { locationName: "Ur of the Chaldees", bookName: "Genesis", chapterNumber: 11 },
  { locationName: "Haran", bookName: "Genesis", chapterNumber: 11 },
  { locationName: "Haran", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Shechem", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Bethel", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Canaan", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Negev", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Nile River", bookName: "Genesis", chapterNumber: 12 },
  { locationName: "Hebron", bookName: "Genesis", chapterNumber: 13 },
  { locationName: "Dead Sea", bookName: "Genesis", chapterNumber: 14 },
  { locationName: "Damascus", bookName: "Genesis", chapterNumber: 15 },
  { locationName: "Dead Sea", bookName: "Genesis", chapterNumber: 19 },
  { locationName: "Beersheba", bookName: "Genesis", chapterNumber: 21 },
  { locationName: "Mount Moriah", bookName: "Genesis", chapterNumber: 22 },
  { locationName: "Hebron", bookName: "Genesis", chapterNumber: 23 },
  { locationName: "Mesopotamia", bookName: "Genesis", chapterNumber: 24 },
  { locationName: "Bethel", bookName: "Genesis", chapterNumber: 28 },
  { locationName: "Haran", bookName: "Genesis", chapterNumber: 29 },
  { locationName: "Jabbok River", bookName: "Genesis", chapterNumber: 32 },
  { locationName: "Shechem", bookName: "Genesis", chapterNumber: 33 },
  { locationName: "Bethel", bookName: "Genesis", chapterNumber: 35 },
  { locationName: "Bethlehem", bookName: "Genesis", chapterNumber: 35 },
  { locationName: "Hebron", bookName: "Genesis", chapterNumber: 37 },
  { locationName: "Dothan", bookName: "Genesis", chapterNumber: 37 },
  { locationName: "Goshen", bookName: "Genesis", chapterNumber: 46 },
  { locationName: "Goshen", bookName: "Genesis", chapterNumber: 47 },
  { locationName: "Hebron", bookName: "Genesis", chapterNumber: 50 },

  // ─── Exodus ──────────────────────────────────────────────
  { locationName: "Goshen", bookName: "Exodus", chapterNumber: 1 },
  { locationName: "Nile River", bookName: "Exodus", chapterNumber: 2 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 3 },
  { locationName: "Nile River", bookName: "Exodus", chapterNumber: 7 },
  { locationName: "Goshen", bookName: "Exodus", chapterNumber: 8 },
  { locationName: "Goshen", bookName: "Exodus", chapterNumber: 9 },
  { locationName: "Red Sea", bookName: "Exodus", chapterNumber: 14 },
  { locationName: "Red Sea", bookName: "Exodus", chapterNumber: 15 },
  { locationName: "Wilderness of Sinai", bookName: "Exodus", chapterNumber: 16 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 19 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 20 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 24 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 32 },
  { locationName: "Mount Sinai", bookName: "Exodus", chapterNumber: 34 },

  // ─── Numbers ─────────────────────────────────────────────
  { locationName: "Wilderness of Sinai", bookName: "Numbers", chapterNumber: 1 },
  { locationName: "Wilderness of Paran", bookName: "Numbers", chapterNumber: 13 },
  { locationName: "Canaan", bookName: "Numbers", chapterNumber: 13 },
  { locationName: "Hebron", bookName: "Numbers", chapterNumber: 13 },
  { locationName: "Mount Hor", bookName: "Numbers", chapterNumber: 20 },
  { locationName: "Arnon River", bookName: "Numbers", chapterNumber: 21 },
  { locationName: "Moab", bookName: "Numbers", chapterNumber: 22 },
  { locationName: "Jordan River", bookName: "Numbers", chapterNumber: 35 },

  // ─── Deuteronomy ─────────────────────────────────────────
  { locationName: "Moab", bookName: "Deuteronomy", chapterNumber: 1 },
  { locationName: "Mount Gerizim", bookName: "Deuteronomy", chapterNumber: 11 },
  { locationName: "Mount Ebal", bookName: "Deuteronomy", chapterNumber: 27 },
  { locationName: "Mount Gerizim", bookName: "Deuteronomy", chapterNumber: 27 },
  { locationName: "Jordan River", bookName: "Deuteronomy", chapterNumber: 31 },
  { locationName: "Mount Nebo", bookName: "Deuteronomy", chapterNumber: 34 },
  { locationName: "Mount Pisgah", bookName: "Deuteronomy", chapterNumber: 34 },

  // ─── Joshua ──────────────────────────────────────────────
  { locationName: "Canaan", bookName: "Joshua", chapterNumber: 1 },
  { locationName: "Jericho", bookName: "Joshua", chapterNumber: 2 },
  { locationName: "Jordan River", bookName: "Joshua", chapterNumber: 3 },
  { locationName: "Gilgal", bookName: "Joshua", chapterNumber: 4 },
  { locationName: "Gilgal", bookName: "Joshua", chapterNumber: 5 },
  { locationName: "Jericho", bookName: "Joshua", chapterNumber: 6 },
  { locationName: "Ai", bookName: "Joshua", chapterNumber: 7 },
  { locationName: "Ai", bookName: "Joshua", chapterNumber: 8 },
  { locationName: "Gibeon", bookName: "Joshua", chapterNumber: 9 },
  { locationName: "Gibeon", bookName: "Joshua", chapterNumber: 10 },
  { locationName: "Valley of Jezreel", bookName: "Joshua", chapterNumber: 10 },
  { locationName: "Hazor", bookName: "Joshua", chapterNumber: 11 },
  { locationName: "Hebron", bookName: "Joshua", chapterNumber: 14 },
  { locationName: "Shiloh", bookName: "Joshua", chapterNumber: 18 },
  { locationName: "Shechem", bookName: "Joshua", chapterNumber: 24 },

  // ─── Judges ──────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "Judges", chapterNumber: 1 },
  { locationName: "Bethel", bookName: "Judges", chapterNumber: 1 },
  { locationName: "Mount Tabor", bookName: "Judges", chapterNumber: 4 },
  { locationName: "Kishon River", bookName: "Judges", chapterNumber: 4 },
  { locationName: "Kishon River", bookName: "Judges", chapterNumber: 5 },
  { locationName: "Valley of Jezreel", bookName: "Judges", chapterNumber: 6 },
  { locationName: "Valley of Jezreel", bookName: "Judges", chapterNumber: 7 },
  { locationName: "Shechem", bookName: "Judges", chapterNumber: 9 },
  { locationName: "Gilead", bookName: "Judges", chapterNumber: 11 },
  { locationName: "Gaza", bookName: "Judges", chapterNumber: 16 },
  { locationName: "Bethlehem", bookName: "Judges", chapterNumber: 19 },

  // ─── Ruth ────────────────────────────────────────────────
  { locationName: "Moab", bookName: "Ruth", chapterNumber: 1 },
  { locationName: "Bethlehem", bookName: "Ruth", chapterNumber: 1 },
  { locationName: "Bethlehem", bookName: "Ruth", chapterNumber: 2 },
  { locationName: "Bethlehem", bookName: "Ruth", chapterNumber: 4 },

  // ─── 1 Samuel ────────────────────────────────────────────
  { locationName: "Shiloh", bookName: "1 Samuel", chapterNumber: 1 },
  { locationName: "Shiloh", bookName: "1 Samuel", chapterNumber: 3 },
  { locationName: "Ashdod", bookName: "1 Samuel", chapterNumber: 5 },
  { locationName: "Mizpah", bookName: "1 Samuel", chapterNumber: 7 },
  { locationName: "Gilgal", bookName: "1 Samuel", chapterNumber: 11 },
  { locationName: "Bethlehem", bookName: "1 Samuel", chapterNumber: 16 },
  { locationName: "Valley of Elah", bookName: "1 Samuel", chapterNumber: 17 },
  { locationName: "Philistia", bookName: "1 Samuel", chapterNumber: 17 },
  { locationName: "Hebron", bookName: "1 Samuel", chapterNumber: 30 },
  { locationName: "Mount Gilboa", bookName: "1 Samuel", chapterNumber: 31 },

  // ─── 2 Samuel ────────────────────────────────────────────
  { locationName: "Hebron", bookName: "2 Samuel", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 5 },
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 6 },
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 7 },
  { locationName: "Ammon", bookName: "2 Samuel", chapterNumber: 10 },
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 11 },
  { locationName: "Kidron Valley", bookName: "2 Samuel", chapterNumber: 15 },
  { locationName: "Mount of Olives", bookName: "2 Samuel", chapterNumber: 15 },
  { locationName: "Gilead", bookName: "2 Samuel", chapterNumber: 17 },
  { locationName: "Jerusalem", bookName: "2 Samuel", chapterNumber: 24 },

  // ─── 1 Kings ─────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "1 Kings", chapterNumber: 1 },
  { locationName: "Gibeon", bookName: "1 Kings", chapterNumber: 3 },
  { locationName: "Jerusalem", bookName: "1 Kings", chapterNumber: 6 },
  { locationName: "Jerusalem", bookName: "1 Kings", chapterNumber: 8 },
  { locationName: "Gezer", bookName: "1 Kings", chapterNumber: 9 },
  { locationName: "Judah", bookName: "1 Kings", chapterNumber: 12 },
  { locationName: "Bethel", bookName: "1 Kings", chapterNumber: 12 },
  { locationName: "Dan", bookName: "1 Kings", chapterNumber: 12 },
  { locationName: "Sidon", bookName: "1 Kings", chapterNumber: 17 },
  { locationName: "Mount Carmel", bookName: "1 Kings", chapterNumber: 18 },
  { locationName: "Beersheba", bookName: "1 Kings", chapterNumber: 19 },
  { locationName: "Mount Sinai", bookName: "1 Kings", chapterNumber: 19 },

  // ─── 2 Kings ─────────────────────────────────────────────
  { locationName: "Jordan River", bookName: "2 Kings", chapterNumber: 2 },
  { locationName: "Jericho", bookName: "2 Kings", chapterNumber: 2 },
  { locationName: "Damascus", bookName: "2 Kings", chapterNumber: 5 },
  { locationName: "Jordan River", bookName: "2 Kings", chapterNumber: 5 },
  { locationName: "Samaria", bookName: "2 Kings", chapterNumber: 6 },
  { locationName: "Samaria", bookName: "2 Kings", chapterNumber: 17 },
  { locationName: "Nineveh", bookName: "2 Kings", chapterNumber: 19 },
  { locationName: "Jerusalem", bookName: "2 Kings", chapterNumber: 22 },
  { locationName: "Jerusalem", bookName: "2 Kings", chapterNumber: 23 },
  { locationName: "Babylon", bookName: "2 Kings", chapterNumber: 24 },
  { locationName: "Babylon", bookName: "2 Kings", chapterNumber: 25 },
  { locationName: "Jerusalem", bookName: "2 Kings", chapterNumber: 25 },
  { locationName: "Lachish", bookName: "2 Kings", chapterNumber: 18 },

  // ─── 1 Chronicles ────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "1 Chronicles", chapterNumber: 11 },
  { locationName: "Hebron", bookName: "1 Chronicles", chapterNumber: 11 },

  // ─── 2 Chronicles ────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "2 Chronicles", chapterNumber: 1 },
  { locationName: "Mount Moriah", bookName: "2 Chronicles", chapterNumber: 3 },
  { locationName: "Jerusalem", bookName: "2 Chronicles", chapterNumber: 5 },
  { locationName: "Jerusalem", bookName: "2 Chronicles", chapterNumber: 36 },
  { locationName: "Babylon", bookName: "2 Chronicles", chapterNumber: 36 },

  // ─── Ezra & Nehemiah ─────────────────────────────────────
  { locationName: "Babylon", bookName: "Ezra", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Ezra", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Ezra", chapterNumber: 3 },
  { locationName: "Jerusalem", bookName: "Nehemiah", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Nehemiah", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Nehemiah", chapterNumber: 3 },

  // ─── Esther ──────────────────────────────────────────────
  { locationName: "Susa", bookName: "Esther", chapterNumber: 1 },
  { locationName: "Susa", bookName: "Esther", chapterNumber: 2 },
  { locationName: "Susa", bookName: "Esther", chapterNumber: 4 },

  // ─── Psalms ──────────────────────────────────────────────
  { locationName: "Mount Zion", bookName: "Psalms", chapterNumber: 48 },
  { locationName: "Jordan River", bookName: "Psalms", chapterNumber: 42 },
  { locationName: "Mount Hermon", bookName: "Psalms", chapterNumber: 133 },
  { locationName: "Jerusalem", bookName: "Psalms", chapterNumber: 122 },
  { locationName: "Jerusalem", bookName: "Psalms", chapterNumber: 137 },
  { locationName: "Babylon", bookName: "Psalms", chapterNumber: 137 },

  // ─── Isaiah ──────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "Isaiah", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Isaiah", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Isaiah", chapterNumber: 6 },
  { locationName: "Galilee", bookName: "Isaiah", chapterNumber: 9 },
  { locationName: "Babylon", bookName: "Isaiah", chapterNumber: 13 },
  { locationName: "Babylon", bookName: "Isaiah", chapterNumber: 14 },
  { locationName: "Moab", bookName: "Isaiah", chapterNumber: 15 },
  { locationName: "Damascus", bookName: "Isaiah", chapterNumber: 17 },
  { locationName: "Nile River", bookName: "Isaiah", chapterNumber: 19 },
  { locationName: "Tyre", bookName: "Isaiah", chapterNumber: 23 },
  { locationName: "Jerusalem", bookName: "Isaiah", chapterNumber: 36 },
  { locationName: "Nineveh", bookName: "Isaiah", chapterNumber: 37 },

  // ─── Jeremiah ────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "Jeremiah", chapterNumber: 1 },
  { locationName: "Valley of Hinnom", bookName: "Jeremiah", chapterNumber: 7 },
  { locationName: "Jerusalem", bookName: "Jeremiah", chapterNumber: 19 },
  { locationName: "Babylon", bookName: "Jeremiah", chapterNumber: 25 },
  { locationName: "Babylon", bookName: "Jeremiah", chapterNumber: 29 },
  { locationName: "Jerusalem", bookName: "Jeremiah", chapterNumber: 39 },
  { locationName: "Babylon", bookName: "Jeremiah", chapterNumber: 50 },
  { locationName: "Babylon", bookName: "Jeremiah", chapterNumber: 51 },

  // ─── Ezekiel ─────────────────────────────────────────────
  { locationName: "Babylon", bookName: "Ezekiel", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Ezekiel", chapterNumber: 8 },
  { locationName: "Jerusalem", bookName: "Ezekiel", chapterNumber: 10 },
  { locationName: "Tyre", bookName: "Ezekiel", chapterNumber: 26 },
  { locationName: "Tyre", bookName: "Ezekiel", chapterNumber: 27 },
  { locationName: "Edom", bookName: "Ezekiel", chapterNumber: 35 },
  { locationName: "Dead Sea", bookName: "Ezekiel", chapterNumber: 47 },

  // ─── Daniel ──────────────────────────────────────────────
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 1 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 2 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 3 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 4 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 5 },
  { locationName: "Babylon", bookName: "Daniel", chapterNumber: 6 },
  { locationName: "Susa", bookName: "Daniel", chapterNumber: 8 },
  { locationName: "Jerusalem", bookName: "Daniel", chapterNumber: 9 },

  // ─── Minor Prophets ──────────────────────────────────────
  { locationName: "Samaria", bookName: "Hosea", chapterNumber: 1 },
  { locationName: "Valley of Jezreel", bookName: "Hosea", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Joel", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Joel", chapterNumber: 3 },
  { locationName: "Samaria", bookName: "Amos", chapterNumber: 3 },
  { locationName: "Bethel", bookName: "Amos", chapterNumber: 7 },
  { locationName: "Edom", bookName: "Obadiah", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Obadiah", chapterNumber: 1 },
  { locationName: "Nineveh", bookName: "Jonah", chapterNumber: 1 },
  { locationName: "Joppa", bookName: "Jonah", chapterNumber: 1 },
  { locationName: "Nineveh", bookName: "Jonah", chapterNumber: 3 },
  { locationName: "Bethlehem", bookName: "Micah", chapterNumber: 5 },
  { locationName: "Jerusalem", bookName: "Micah", chapterNumber: 1 },
  { locationName: "Nineveh", bookName: "Nahum", chapterNumber: 1 },
  { locationName: "Nineveh", bookName: "Nahum", chapterNumber: 3 },
  { locationName: "Babylon", bookName: "Habakkuk", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Zephaniah", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Haggai", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Haggai", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Zechariah", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Zechariah", chapterNumber: 14 },
  { locationName: "Mount of Olives", bookName: "Zechariah", chapterNumber: 14 },
  { locationName: "Jerusalem", bookName: "Malachi", chapterNumber: 3 },

  // ─── Matthew ─────────────────────────────────────────────
  { locationName: "Bethlehem", bookName: "Matthew", chapterNumber: 2 },
  { locationName: "Nazareth", bookName: "Matthew", chapterNumber: 2 },
  { locationName: "Jordan River", bookName: "Matthew", chapterNumber: 3 },
  { locationName: "Wilderness of Judea", bookName: "Matthew", chapterNumber: 3 },
  { locationName: "Wilderness of Judea", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Galilee", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Sea of Galilee", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Capernaum", bookName: "Matthew", chapterNumber: 4 },
  { locationName: "Capernaum", bookName: "Matthew", chapterNumber: 8 },
  { locationName: "Sea of Galilee", bookName: "Matthew", chapterNumber: 8 },
  { locationName: "Sea of Galilee", bookName: "Matthew", chapterNumber: 14 },
  { locationName: "Tyre", bookName: "Matthew", chapterNumber: 15 },
  { locationName: "Sidon", bookName: "Matthew", chapterNumber: 15 },
  { locationName: "Caesarea Philippi", bookName: "Matthew", chapterNumber: 16 },
  { locationName: "Jerusalem", bookName: "Matthew", chapterNumber: 21 },
  { locationName: "Mount of Olives", bookName: "Matthew", chapterNumber: 21 },
  { locationName: "Jerusalem", bookName: "Matthew", chapterNumber: 23 },
  { locationName: "Mount of Olives", bookName: "Matthew", chapterNumber: 24 },
  { locationName: "Gethsemane", bookName: "Matthew", chapterNumber: 26 },
  { locationName: "Golgotha", bookName: "Matthew", chapterNumber: 27 },
  { locationName: "Galilee", bookName: "Matthew", chapterNumber: 28 },

  // ─── Mark ────────────────────────────────────────────────
  { locationName: "Jordan River", bookName: "Mark", chapterNumber: 1 },
  { locationName: "Capernaum", bookName: "Mark", chapterNumber: 1 },
  { locationName: "Galilee", bookName: "Mark", chapterNumber: 1 },
  { locationName: "Capernaum", bookName: "Mark", chapterNumber: 2 },
  { locationName: "Sea of Galilee", bookName: "Mark", chapterNumber: 4 },
  { locationName: "Sea of Galilee", bookName: "Mark", chapterNumber: 6 },
  { locationName: "Bethsaida", bookName: "Mark", chapterNumber: 6 },
  { locationName: "Tyre", bookName: "Mark", chapterNumber: 7 },
  { locationName: "Sidon", bookName: "Mark", chapterNumber: 7 },
  { locationName: "Caesarea Philippi", bookName: "Mark", chapterNumber: 8 },
  { locationName: "Jerusalem", bookName: "Mark", chapterNumber: 11 },
  { locationName: "Mount of Olives", bookName: "Mark", chapterNumber: 13 },
  { locationName: "Gethsemane", bookName: "Mark", chapterNumber: 14 },
  { locationName: "Golgotha", bookName: "Mark", chapterNumber: 15 },

  // ─── Luke ────────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "Luke", chapterNumber: 1 },
  { locationName: "Nazareth", bookName: "Luke", chapterNumber: 1 },
  { locationName: "Bethlehem", bookName: "Luke", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Luke", chapterNumber: 2 },
  { locationName: "Nazareth", bookName: "Luke", chapterNumber: 2 },
  { locationName: "Jordan River", bookName: "Luke", chapterNumber: 3 },
  { locationName: "Nazareth", bookName: "Luke", chapterNumber: 4 },
  { locationName: "Capernaum", bookName: "Luke", chapterNumber: 4 },
  { locationName: "Sea of Galilee", bookName: "Luke", chapterNumber: 5 },
  { locationName: "Nain", bookName: "Luke", chapterNumber: 7 },
  { locationName: "Bethsaida", bookName: "Luke", chapterNumber: 9 },
  { locationName: "Samaria Region", bookName: "Luke", chapterNumber: 10 },
  { locationName: "Jericho", bookName: "Luke", chapterNumber: 10 },
  { locationName: "Jerusalem", bookName: "Luke", chapterNumber: 13 },
  { locationName: "Jerusalem", bookName: "Luke", chapterNumber: 19 },
  { locationName: "Jericho", bookName: "Luke", chapterNumber: 19 },
  { locationName: "Mount of Olives", bookName: "Luke", chapterNumber: 22 },
  { locationName: "Golgotha", bookName: "Luke", chapterNumber: 23 },
  { locationName: "Emmaus", bookName: "Luke", chapterNumber: 24 },

  // ─── John ────────────────────────────────────────────────
  { locationName: "Jordan River", bookName: "John", chapterNumber: 1 },
  { locationName: "Bethany", bookName: "John", chapterNumber: 1 },
  { locationName: "Cana", bookName: "John", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "John", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "John", chapterNumber: 3 },
  { locationName: "Samaria Region", bookName: "John", chapterNumber: 4 },
  { locationName: "Sychar", bookName: "John", chapterNumber: 4 },
  { locationName: "Cana", bookName: "John", chapterNumber: 4 },
  { locationName: "Pool of Bethesda", bookName: "John", chapterNumber: 5 },
  { locationName: "Sea of Galilee", bookName: "John", chapterNumber: 6 },
  { locationName: "Bethsaida", bookName: "John", chapterNumber: 6 },
  { locationName: "Capernaum", bookName: "John", chapterNumber: 6 },
  { locationName: "Jerusalem", bookName: "John", chapterNumber: 7 },
  { locationName: "Siloam", bookName: "John", chapterNumber: 9 },
  { locationName: "Jerusalem", bookName: "John", chapterNumber: 10 },
  { locationName: "Bethany", bookName: "John", chapterNumber: 11 },
  { locationName: "Bethany", bookName: "John", chapterNumber: 12 },
  { locationName: "Jerusalem", bookName: "John", chapterNumber: 13 },
  { locationName: "Kidron Valley", bookName: "John", chapterNumber: 18 },
  { locationName: "Gethsemane", bookName: "John", chapterNumber: 18 },
  { locationName: "Golgotha", bookName: "John", chapterNumber: 19 },
  { locationName: "Sea of Galilee", bookName: "John", chapterNumber: 21 },

  // ─── Acts ────────────────────────────────────────────────
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 1 },
  { locationName: "Mount of Olives", bookName: "Acts", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 2 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 3 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 5 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 6 },
  { locationName: "Samaria", bookName: "Acts", chapterNumber: 8 },
  { locationName: "Gaza", bookName: "Acts", chapterNumber: 8 },
  { locationName: "Damascus", bookName: "Acts", chapterNumber: 9 },
  { locationName: "Tarsus", bookName: "Acts", chapterNumber: 9 },
  { locationName: "Joppa", bookName: "Acts", chapterNumber: 9 },
  { locationName: "Caesarea Maritima", bookName: "Acts", chapterNumber: 10 },
  { locationName: "Joppa", bookName: "Acts", chapterNumber: 10 },
  { locationName: "Antioch of Syria", bookName: "Acts", chapterNumber: 11 },
  { locationName: "Cyprus", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Antioch of Syria", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Salamis", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Paphos", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Antioch of Pisidia", bookName: "Acts", chapterNumber: 13 },
  { locationName: "Iconium", bookName: "Acts", chapterNumber: 14 },
  { locationName: "Lystra", bookName: "Acts", chapterNumber: 14 },
  { locationName: "Derbe", bookName: "Acts", chapterNumber: 14 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 15 },
  { locationName: "Philippi", bookName: "Acts", chapterNumber: 16 },
  { locationName: "Lystra", bookName: "Acts", chapterNumber: 16 },
  { locationName: "Troas", bookName: "Acts", chapterNumber: 16 },
  { locationName: "Thessalonica", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Berea", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Athens", bookName: "Acts", chapterNumber: 17 },
  { locationName: "Corinth", bookName: "Acts", chapterNumber: 18 },
  { locationName: "Ephesus", bookName: "Acts", chapterNumber: 18 },
  { locationName: "Ephesus", bookName: "Acts", chapterNumber: 19 },
  { locationName: "Troas", bookName: "Acts", chapterNumber: 20 },
  { locationName: "Miletus", bookName: "Acts", chapterNumber: 20 },
  { locationName: "Tyre", bookName: "Acts", chapterNumber: 21 },
  { locationName: "Caesarea Maritima", bookName: "Acts", chapterNumber: 21 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 21 },
  { locationName: "Jerusalem", bookName: "Acts", chapterNumber: 22 },
  { locationName: "Caesarea Maritima", bookName: "Acts", chapterNumber: 23 },
  { locationName: "Caesarea Maritima", bookName: "Acts", chapterNumber: 24 },
  { locationName: "Caesarea Maritima", bookName: "Acts", chapterNumber: 25 },
  { locationName: "Sidon", bookName: "Acts", chapterNumber: 27 },
  { locationName: "Crete", bookName: "Acts", chapterNumber: 27 },
  { locationName: "Malta", bookName: "Acts", chapterNumber: 28 },
  { locationName: "Syracuse", bookName: "Acts", chapterNumber: 28 },
  { locationName: "Puteoli", bookName: "Acts", chapterNumber: 28 },
  { locationName: "Rome", bookName: "Acts", chapterNumber: 28 },

  // ─── Pauline Epistles ────────────────────────────────────
  { locationName: "Rome", bookName: "Romans", chapterNumber: 1 },
  { locationName: "Corinth", bookName: "1 Corinthians", chapterNumber: 1 },
  { locationName: "Corinth", bookName: "2 Corinthians", chapterNumber: 1 },
  { locationName: "Galatia", bookName: "Galatians", chapterNumber: 1 },
  { locationName: "Jerusalem", bookName: "Galatians", chapterNumber: 2 },
  { locationName: "Ephesus", bookName: "Ephesians", chapterNumber: 1 },
  { locationName: "Philippi", bookName: "Philippians", chapterNumber: 1 },
  { locationName: "Colossae", bookName: "Colossians", chapterNumber: 1 },
  { locationName: "Thessalonica", bookName: "1 Thessalonians", chapterNumber: 1 },
  { locationName: "Thessalonica", bookName: "2 Thessalonians", chapterNumber: 1 },
  { locationName: "Crete", bookName: "Titus", chapterNumber: 1 },

  // ─── Revelation ──────────────────────────────────────────
  { locationName: "Patmos", bookName: "Revelation", chapterNumber: 1 },
  { locationName: "Ephesus", bookName: "Revelation", chapterNumber: 2 },
  { locationName: "Smyrna", bookName: "Revelation", chapterNumber: 2 },
  { locationName: "Pergamum", bookName: "Revelation", chapterNumber: 2 },
  { locationName: "Thyatira", bookName: "Revelation", chapterNumber: 2 },
  { locationName: "Sardis", bookName: "Revelation", chapterNumber: 3 },
  { locationName: "Philadelphia", bookName: "Revelation", chapterNumber: 3 },
  { locationName: "Laodicea", bookName: "Revelation", chapterNumber: 3 },
  { locationName: "Euphrates River", bookName: "Revelation", chapterNumber: 9 },
  { locationName: "Euphrates River", bookName: "Revelation", chapterNumber: 16 },
  { locationName: "Megiddo", bookName: "Revelation", chapterNumber: 16 },
  { locationName: "Babylon", bookName: "Revelation", chapterNumber: 17 },
  { locationName: "Babylon", bookName: "Revelation", chapterNumber: 18 },
  { locationName: "Jerusalem", bookName: "Revelation", chapterNumber: 21 },
];

export function seedLocationReferences(locationIdMap: Map<string, number>): void {
  console.log("🔗 Seeding location references...");

  // Check if references already exist
  const existingRefs = db.select().from(locationReferences).all();
  if (existingRefs.length >= LOCATION_REFS.length) {
    console.log(`   Location references already seeded (${existingRefs.length} records), skipping`);
    return;
  }

  // Clear partial data
  if (existingRefs.length > 0) {
    console.log("   Clearing partial location reference data...");
    db.delete(locationReferences).run();
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const ref of LOCATION_REFS) {
    const locationId = locationIdMap.get(ref.locationName);
    if (!locationId) {
      skippedCount++;
      continue;
    }

    // Find the book by name
    const book = db
      .select()
      .from(books)
      .where(eq(books.name, ref.bookName))
      .get();

    if (!book) {
      skippedCount++;
      continue;
    }

    // Find the chapter
    const chapter = db
      .select()
      .from(chapters)
      .where(
        and(
          eq(chapters.bookId, book.id),
          eq(chapters.chapterNumber, ref.chapterNumber)
        )
      )
      .get();

    if (!chapter) {
      skippedCount++;
      continue;
    }

    db.insert(locationReferences)
      .values({
        locationId,
        bookId: book.id,
        chapterId: chapter.id,
      })
      .run();

    insertedCount++;
  }

  console.log(`   ✓ ${insertedCount} location references inserted (${skippedCount} skipped)`);
}
