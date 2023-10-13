const button = document.createElement("button");
button.id = "btnExport";
button.type = "button";
button.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-down"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>`
button.appendChild(document.createTextNode(" Export to CSV"));

document.body.appendChild(button);

class CsvExport {
  constructor(table, header = true) {
    this.table = table;
    this.rows = Array.from(table.querySelectorAll("tr"));
    if (!header && this.rows[0].querySelectorAll("th").length) {
      this.rows.shift();
    }
  }

  exportCsv() {
    const lines = this.rows.map((row) =>
      Array.from(row.children)
        .map((cell) => CsvExport.safeData(cell, textRemovalRules))
        .join("\t")
    );
    return lines.join("\n");
  }

  static safeData(td, textRemovalRules) {
    let data = td.textContent;
    let regex = /(\d{0,14}[A-Z]?)(?=\s?\(EAN\))/;

    if (regex.test(data)) {
      data = data.match(regex)[1];
    }

    textRemovalRules.forEach((rule) => {
      if (rule.type === 1) {
        data = data.replace(new RegExp(escapeRegExp(rule.text), 'g'), '');
      } else if (rule.type === 2) {
        const flags = rule.caseInsensitive ? 'gi' : 'g';
        data = data.replace(new RegExp(`${escapeRegExp(rule.text)}.*$`, flags), '');
      }
    });
    // data = data.replace(/,/g, ",");
    return data;
  }
}

const btnExport = document.querySelector("#btnExport");
const tableElement = document.querySelector(
  "#fattura-elettronica table:nth-child(7)"
);

// 1: complete, 2: fromItsPosition
const textRemovalRules = [
  { type: 1, text: "(AswArtFor)" },
  { type: 2, text: "Lotto:" },
  { type: 2, text: "Tipo Dato:", caseInsensitive: true },
  { type: 2, text: "Vs.Ord. O/", caseInsensitive: true },
  { extractEAN: true },
];
function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

function download_table_as_csv(table_id) {
  // Select rows from table_id
  var rows = document.querySelectorAll('' + table_id + ' tr');
  // Construct csv
  var csv = [];
  for (var i = 0; i < rows.length; i++) {
    var row = [],
      cols = rows[i].querySelectorAll('td, th');
    var rowIsEmpty = true; // Flag to check if the row is empty
    for (var j = 0; j < cols.length; j++) {
      // Clean innertext and apply text removal rules
      var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
      data = CsvExport.safeData({ textContent: data }, textRemovalRules);
      // Escape commas by wrapping the field in double quotes
      if (data.includes(',') || data.includes('\n')) {
        data = `"${data.replace(/"/g, '""')}"`;
      }
      row.push(data);
      // Check if the cell contains non-whitespace content
      if (data.trim() !== '') {
        rowIsEmpty = false;
      }
    }

    if (!rowIsEmpty) {
      csv.push(row.join(","));
    }
  }
  var csv_string = csv.join('\n');
  // Download it
  var filename = 'export_' + table_id + '_' + new Date().toLocaleDateString() + '.csv';
  var link = document.createElement('a');
  link.style.display = 'none';
  link.setAttribute('target', '_blank');
  link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


btnExport.addEventListener("click", () => {
  download_table_as_csv("#fattura-elettronica table:nth-child(7)")
});


function addStyle(styleString) {
  const style = document.createElement('style');
  style.textContent = styleString;
  document.head.append(style);
}

addStyle(`#btnExport {
display: flex;
align-items: center;
justify-items: center;
gap: 10px;
font-size: 1rem;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translatex(-50%);
        padding: 14px 32px;
        border-radius:999px;
        cursor: pointer;

        background-color: rgba(21,23,24);
        color: white;
        
        transition-property: all;
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: .25s;
      }
      #btnExport:hover{
        transform: translatex(-50%) scale(1.05);
        
      }
      #fattura-elettronica table:nth-child(7) {
        /* background: red; */
      }`)