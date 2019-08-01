package pages;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

import pages.components.Header;
import utils.Constants;


public class HomePage extends BasePage {

	public HomePage(WebDriver driver) {
		super(driver);
		PageFactory.initElements(driver, this);
	}

	@Override
	public void presetUrl() {
		setUrl(Constants.getBaseUrlBigNeon());
	}

	public List<WebElement> checkForResultOfSearch(String searchParam) {
		List<WebElement> elements = driver.findElements(By.xpath("a[contains(@href,'"+searchParam+"']"));
		return elements;
	}
	
	public boolean selectFirstFromFilteredList(String searchParam) {
		List<WebElement> elements = checkForResultOfSearch(searchParam);
		if (!elements.isEmpty()) {
			elements.get(0).click();
			return true;
		}
		return false;
	}
	
	public void logOut() {
		Header header = new Header(driver);
		header.logOut();
	}

}