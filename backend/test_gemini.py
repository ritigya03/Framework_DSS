import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()  # this loads .env

genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel(model_name="gemini-2.5-flash")

resp = model.generate_content("Hi")
print(resp.text)
