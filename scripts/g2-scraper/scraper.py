import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

# Initialize WebDriver using webdriver_manager to auto-download the correct ChromeDriver version
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# Base URL for the machine learning products category (first page)
base_url = "https://www.trustradius.com/machine-learning"

# Function to extract product links from a page
def get_product_links(page_url):
    driver.get(page_url)
    time.sleep(3)  # Wait for the page to load

    soup = BeautifulSoup(driver.page_source, "html.parser")
    product_links = []

    # Locate product links
    for link in soup.select("a[href*='/products/']"):
        href = link.get("href")
        if href and href.startswith("/products/") and href not in product_links:
            product_links.append("https://www.trustradius.com" + href)

    return product_links

# Function to handle pagination and get all product links across pages
def get_all_product_links():
    all_product_links = []
    page_number = 1

    while True:
        page_url = f"{base_url}?page={page_number}"
        print(f"Scraping product links from: {page_url}")
        product_links = get_product_links(page_url)
        
        # If no new links are found, we've reached the end
        if not product_links:
            break

        all_product_links.extend(product_links)
        page_number += 1

        # Limit to 10 pages to avoid infinite loop or unnecessary scraping
        if page_number > 10:
            break

    return list(set(all_product_links))  # Remove duplicates

# Function to scrape details from an individual product page
def scrape_product_page(url):
    driver.get(url)
    time.sleep(3)  # Allow page to load fully

    soup = BeautifulSoup(driver.page_source, "html.parser")

    # Define selectors based on the page structure
    def extract_text(selector):
        element = soup.select_one(selector)
        return element.get_text(strip=True) if element else "N/A"

    # Product name
    name = extract_text("h1")

    # Product description
    description = extract_text(".ProductOverview_wysiwyg-text__qyaAp p")

    # Features section
    features_section = soup.select(".FeaturesSection_feature-list__hS9Jh li span:nth-of-type(2)")
    features = [feature.get_text(strip=True) for feature in features_section]
    features_text = "; ".join(features) if features else "N/A"

    # Technical details
    technical_details_section = soup.select(".TechnicalDetails_table__fL19a tr")
    technical_details = {row.th.get_text(strip=True): row.td.get_text(strip=True) for row in technical_details_section}
    deployment_types = technical_details.get("Deployment Types", "N/A")
    operating_systems = technical_details.get("Operating Systems", "N/A")
    mobile_app = technical_details.get("Mobile Application", "N/A")

    # FAQs - extract common questions like pricing and competitors
    faq_sections = soup.select(".FaqQuestion_toggle-section__MKGEp")
    faq_data = {}
    for section in faq_sections:
        question = section.select_one("button > span").get_text(strip=True)
        answer = section.select_one(".FaqQuestion_answer__TcR_e").get_text(strip=True)
        faq_data[question] = answer

    pricing = faq_data.get("How much does IBM watsonx.ai cost?", "N/A")
    top_competitors = faq_data.get("What are IBM watsonx.ai's top competitors?", "N/A")

    # Compile all data into a dictionary
    product_data = {
        "Name": name,
        "Description": description,
        "Features": features_text,
        "Deployment Types": deployment_types,
        "Operating Systems": operating_systems,
        "Mobile Application": mobile_app,
        "Pricing": pricing,
        "Top Competitors": top_competitors,
    }

    return product_data

# Main function to orchestrate scraping
def main():
    # Get all product links across pagination
    all_product_links = get_all_product_links()
    print(f"Found {len(all_product_links)} products across pages.")

    # List to hold all scraped data
    products_data = []

    # Scrape each product link
    for link in all_product_links:
        print(f"Scraping {link}")
        product_data = scrape_product_page(link)
        products_data.append(product_data)

    # Save scraped data to a CSV file
    df = pd.DataFrame(products_data)
    output_file = "machine_learning_products.csv"
    df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")

    # Close the WebDriver
    driver.quit()

if __name__ == "__main__":
    main()
