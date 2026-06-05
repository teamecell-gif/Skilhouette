/**
 * Utility to extract Google Sheet ID from various URL formats or returns the ID directly.
 */
export function extractSheetId(input) {
  if (!input) return "";
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

/**
 * Utility to extract gid parameter (tab ID) from Google Sheet URL.
 */
export function extractGid(input) {
  if (!input) return 0;
  const match = input.match(/[?&]gid=(\d+)/);
  return match ? Number(match[1]) : 0;
}

/**
 * Maps column headers to participant properties dynamically and uniquely.
 */
function mapColumns(headers) {
  const mapping = { nameIdx: -1, deptIdx: -1, pointsIdx: -1, photoIdx: -1 };
  const assigned = new Set();

  // 1. Prioritized points column mapping (explicit "total points")
  headers.forEach((header, idx) => {
    const label = (header || "").toLowerCase().trim();
    if (/^(total\s+points|total\s+pts|total\s+score)$/i.test(label)) {
      mapping.pointsIdx = idx;
      assigned.add(idx);
    }
  });

  // 2. Map Name (highly critical)
  for (let i = 0; i < headers.length; i++) {
    if (assigned.has(i)) continue;
    const label = (headers[i] || "").toLowerCase().trim();
    if (/name|participant|player|user|contestant|member/i.test(label)) {
      mapping.nameIdx = i;
      assigned.add(i);
      break;
    }
  }

  // 3. Map Points (if not already mapped in step 1)
  if (mapping.pointsIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (assigned.has(i)) continue;
      const label = (headers[i] || "").toLowerCase().trim();
      if (/points|pts|score|value|total|count/i.test(label)) {
        mapping.pointsIdx = i;
        assigned.add(i);
        break;
      }
    }
  }

  // 4. Map Department/Group
  for (let i = 0; i < headers.length; i++) {
    if (assigned.has(i)) continue;
    const label = (headers[i] || "").toLowerCase().trim();
    if (/dept|department|group|team|org|organization|house|class/i.test(label)) {
      mapping.deptIdx = i;
      assigned.add(i);
      break;
    }
  }

  // 5. Map Photo URL
  for (let i = 0; i < headers.length; i++) {
    if (assigned.has(i)) continue;
    const label = (headers[i] || "").toLowerCase().trim();
    if (/photo|image|pic|avatar|url|link/i.test(label)) {
      mapping.photoIdx = i;
      assigned.add(i);
      break;
    }
  }

  // Fallbacks if mapping failed
  if (mapping.nameIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (!assigned.has(i)) {
        mapping.nameIdx = i;
        assigned.add(i);
        break;
      }
    }
  }

  if (mapping.pointsIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (!assigned.has(i)) {
        mapping.pointsIdx = i;
        assigned.add(i);
        break;
      }
    }
  }

  // Only assign fallback dept/photo if there are unassigned columns left (to avoid overlap)
  if (mapping.deptIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (!assigned.has(i)) {
        mapping.deptIdx = i;
        assigned.add(i);
        break;
      }
    }
  }

  if (mapping.photoIdx === -1) {
    for (let i = 0; i < headers.length; i++) {
      if (!assigned.has(i)) {
        mapping.photoIdx = i;
        assigned.add(i);
        break;
      }
    }
  }

  return mapping;
}

/**
 * Fetch sheet data using Google Visualization API (No API Key required, needs Link Sharing enabled)
 */
async function fetchViaVisualizationApi(sheetId, gid = 0) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Sheets fetch failed: ${response.statusText}`);
  }
  const text = await response.text();
  
  // Check if response is HTML (login page redirect due to private sheet)
  if (text.trim().startsWith("<!doctype html") || text.includes("<html") || text.includes("ServiceLogin")) {
    throw new Error("Spreadsheet is private or restricted. Please open your Google Sheet, click 'Share' in the top right, and set General Access to 'Anyone with the link can view'.");
  }

  // Extract JSON string from visualization response wrapper: google.visualization.Query.setResponse({...})
  const startIdx = text.indexOf("google.visualization.Query.setResponse(");
  if (startIdx === -1) {
    throw new Error("Invalid response format from Google Visualization API.");
  }
  
  const jsonStart = startIdx + "google.visualization.Query.setResponse(".length;
  const jsonEnd = text.lastIndexOf(");");
  if (jsonEnd === -1) {
    throw new Error("Invalid response format boundaries from Google Visualization API.");
  }
  
  const jsonStr = text.substring(jsonStart, jsonEnd);
  const data = JSON.parse(jsonStr);
  
  if (data.status === "error") {
    const errorMsg = data.errors && data.errors[0] ? data.errors[0].message : "Unknown error";
    throw new Error(`Google Visualization Error: ${errorMsg}`);
  }

  const cols = data.table.cols || [];
  const rows = data.table.rows || [];

  // Get headers from columns
  let headers = cols.map(c => c.label || "");
  
  // If headers in cols are empty, check if first row contains them
  const hasColLabels = headers.some(h => h.trim() !== "");
  let startRowIdx = 0;
  
  if (!hasColLabels && rows.length > 0) {
    headers = rows[0].c.map(cell => (cell && cell.v !== null ? String(cell.v) : ""));
    startRowIdx = 1;
  }

  const mapping = mapColumns(headers);

  const parsedData = rows.slice(startRowIdx).map((row, rIdx) => {
    const cells = row.c || [];
    const getVal = (idx) => {
      if (idx === -1 || !cells[idx]) return "";
      const val = cells[idx].v;
      return val !== null && val !== undefined ? val : "";
    };

    const pointsRaw = getVal(mapping.pointsIdx);
    const pointsCleaned = typeof pointsRaw === "string" 
      ? pointsRaw.replace(/[\$,\s]/g, "") 
      : pointsRaw;
    const points = Number(pointsCleaned) || 0;

    return {
      name: String(getVal(mapping.nameIdx) || `Participant ${rIdx + 1}`).trim(),
      department: mapping.deptIdx !== -1 ? String(getVal(mapping.deptIdx) || "General").trim() : "General",
      points: points,
      photoUrl: mapping.photoIdx !== -1 ? String(getVal(mapping.photoIdx) || "").trim() : ""
    };
  });

  // Filter out entries with completely empty names
  return parsedData.filter(p => p.name !== "");
}

/**
 * Fetch sheet data using Google Sheets v4 API (Requires API Key)
 */
async function fetchViaSheetsApi(sheetId, apiKey, tabName = "Sheet1") {
  const range = encodeURIComponent(tabName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || response.statusText;
    throw new Error(`Google Sheets API error: ${message}`);
  }

  const data = await response.json();
  const values = data.values || [];
  
  if (values.length === 0) {
    return [];
  }

  const headers = values[0];
  const mapping = mapColumns(headers);

  const parsedData = values.slice(1).map((row, rIdx) => {
    const getVal = (idx) => {
      if (idx === -1 || idx >= row.length) return "";
      const val = row[idx];
      return val !== null && val !== undefined ? val : "";
    };

    const pointsRaw = getVal(mapping.pointsIdx);
    const pointsCleaned = typeof pointsRaw === "string" 
      ? pointsRaw.replace(/[\$,\s]/g, "") 
      : pointsRaw;
    const points = Number(pointsCleaned) || 0;

    return {
      name: String(getVal(mapping.nameIdx) || `Participant ${rIdx + 1}`).trim(),
      department: mapping.deptIdx !== -1 ? String(getVal(mapping.deptIdx) || "General").trim() : "General",
      points: points,
      photoUrl: mapping.photoIdx !== -1 ? String(getVal(mapping.photoIdx) || "").trim() : ""
    };
  });

  return parsedData.filter(p => p.name !== "");
}

/**
 * General fetch function that detects which method to use.
 */
export async function fetchLeaderboardData({ sheetUrlOrId, apiKey, tabName, gid = 0 }) {
  const sheetId = extractSheetId(sheetUrlOrId);
  if (!sheetId) {
    throw new Error("Please enter a valid Google Sheet URL or ID.");
  }

  const targetGid = gid || extractGid(sheetUrlOrId);

  if (apiKey && apiKey.trim() !== "") {
    return fetchViaSheetsApi(sheetId, apiKey, tabName || "Sheet1");
  } else {
    return fetchViaVisualizationApi(sheetId, targetGid);
  }
}
