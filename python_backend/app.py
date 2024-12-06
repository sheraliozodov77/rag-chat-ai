from flask import Flask, request, jsonify
from utils.pdf_utils import extract_text_from_pdf
from utils.llama_index_utils import ingest_documents, query_documents

app = Flask(__name__)

# Route to ingest PDFs
@app.route('/ingest', methods=['POST'])
def ingest():
    try:
        data = request.get_json()
        pdf_urls = data.get("pdf_urls", [])
        ingest_documents(pdf_urls)
        return jsonify({"message": "Documents successfully ingested into Pinecone"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to query the index
@app.route('/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        question = data.get("question", "")
        answer = query_documents(question)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
