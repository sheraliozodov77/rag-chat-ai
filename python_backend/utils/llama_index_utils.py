from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.schema import Document
import pinecone
import os

# Initialize OpenAI and Pinecone
os.environ["OPENAI_API_KEY"] = "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"
pinecone.init(api_key="pcsk_29dHpN_S6WYmxUmCkvdLmvoZWu8NZ7XoVvw41hHUUEBd1m1L1EFXHGe46DRy1xHjfF68X6", environment="us-east-1")
pinecone_index_name = "legal-docs"

# Function to ingest documents into Pinecone
def ingest_documents(pdf_urls):
    from utils.pdf_utils import extract_text_from_pdf
    embeddings = OpenAIEmbeddings()
    vector_store = Pinecone(pinecone_index_name, embeddings)

    for url in pdf_urls:
        text = extract_text_from_pdf(url)
        if text:
            doc = Document(page_content=text, metadata={"url": url})
            vector_store.add_documents([doc])

# Function to query the index
def query_documents(question):
    embeddings = OpenAIEmbeddings()
    vector_store = Pinecone(pinecone_index_name, embeddings)
    docs = vector_store.similarity_search(question, k=5)
    context = "\n".join([doc.page_content for doc in docs])

    from llama_index import GPTListIndex
    response = GPTListIndex.from_documents([context]).query(question)
    return response
