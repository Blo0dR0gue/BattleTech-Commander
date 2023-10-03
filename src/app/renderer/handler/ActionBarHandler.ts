import { CameraController } from '../controller/CameraController';
import { Planet } from '../models/Planet';
import { SelectionChangeEvent } from './events/SelectionChangedEvent';
import { Modal } from 'bootstrap';
import { UpdateRouteEvent } from './events/UpdateRouteVent';
import { RouteController } from '../controller/RouteController';

class ActionBarHandler {
  private navButtons: NodeListOf<HTMLDivElement>;
  private contentArea: HTMLDivElement;
  private routeItemsContainer: HTMLElement;

  private planetNameArea: HTMLElement;
  private affiliationNameArea: HTMLElement;
  private wikiLinkArea: HTMLLinkElement;

  // TODO: Move to index???
  private disclaimer: HTMLDivElement;
  private disclaimerModal: Modal;

  private selectedPlanet: Planet | null;

  // TODO: Rework (remove here)
  private routeController: RouteController;
  private cameraController: CameraController;

  public constructor() {
    this.navButtons = document.querySelectorAll('.btn-actionBar');
    this.contentArea = document.getElementById('content-box') as HTMLDivElement;
    this.routeItemsContainer = document.getElementById('route-container');
    this.planetNameArea = document.getElementById('planet-name');
    this.affiliationNameArea = document.getElementById('affiliation-name');
    this.wikiLinkArea = document.getElementById('wiki-link') as HTMLLinkElement;
    this.disclaimer = document.getElementById('disclaimer') as HTMLDivElement;
    this.disclaimerModal = new Modal(
      document.getElementById('disclaimer-modal'),
      {
        backdrop: true,
        keyboard: false,
        focus: true,
      }
    );
  }

  public init(camera: CameraController) {
    this.navButtons.forEach((element) => {
      if (element.id === undefined || element.dataset.content === undefined)
        return;
      element.addEventListener(
        'click',
        function () {
          this.showTab(element.dataset.content, element);
        }.bind(this)
      );
    });

    this.disclaimer.addEventListener('click', this.showDisclaimer.bind(this));
    this.cameraController = camera;

    this.cameraController.selectionChangeEvent.subscribe(
      this.planetChanged.bind(this)
    );
    this.cameraController.updateRouteEvent.subscribe(
      this.routeChanged.bind(this)
    );
    this.routeController = camera.getRouteManager();
  }

  private showDisclaimer() {
    this.disclaimerModal.show();
  }

  private planetChanged(planetChanged: SelectionChangeEvent) {
    this.selectedPlanet = planetChanged.planet;
    // TODO: simplify
    if (this.selectedPlanet === null) {
      this.updateText(this.planetNameArea, 'None');
      this.updateText(this.affiliationNameArea, 'None');
      this.wikiLinkArea.href = '#';
    } else {
      this.updateText(this.planetNameArea, this.selectedPlanet.getName());
      this.updateText(
        this.affiliationNameArea,
        this.selectedPlanet.getAffiliationName()
      );
      // TODO: Open in new window on click
      this.wikiLinkArea.href = this.selectedPlanet.getWikiURL();
    }
  }

  private routeChanged(routeChanged: UpdateRouteEvent) {
    if (routeChanged.planet !== undefined && routeChanged.add) {
      if (routeChanged.numberPlanets > 1) {
        // TODO: Rework that. Only for first function tests!
        this.routeController.calculateRoute(30);
        this.createRouteJumpCard(
          this.routeController.getNumberOfJumpsBetweenIDs(
            routeChanged.numberPlanets - 2,
            routeChanged.numberPlanets - 1
          )
        );
      }
      this.createPlanetRouteCard(routeChanged.planet);
    }
  }

  private showTab(tabName, button) {
    // Hide all tab contents
    const tabContents = this.contentArea
      .children as HTMLCollectionOf<HTMLDivElement>;
    for (let i = 0; i < tabContents.length; i++) {
      tabContents[i].classList.add('hide');
    }

    // Show the selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab === null) return;
    selectedTab.classList.remove('hide');

    this.navButtons.forEach((element) => {
      if (element === button) {
        element.classList.add('bg-selected');
      } else {
        element.classList.remove('bg-selected');
      }
    });
  }

  private updateText(element: HTMLElement, text: string) {
    element.textContent = text;
  }

  private createPlanetRouteCard(planet: Planet) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card text-white my-auto flex-shrink-0';
    cardDiv.style.width = '180px';
    cardDiv.dataset.planetName = planet.getName();

    const cardBodyDiv = document.createElement('div');
    cardBodyDiv.className = 'card-body p-2';

    const cardTitle = document.createElement('h5');
    cardTitle.className = 'card-title text-center';
    cardTitle.textContent = planet.getName();

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'x';

    const cardText = document.createElement('p');
    cardText.className = 'card-text text-center';
    cardText.textContent = `${planet.coord.getX()} | ${planet.coord.getY()}`;

    const centerButton = document.createElement('button');
    centerButton.className = 'btn btn-info btn-sm';
    centerButton.textContent = 'o';
    centerButton.onclick = () => {
      this.cameraController.centerOnPlanetByName(cardDiv.dataset.planetName);
    };

    // Append the elements to build the card
    cardTitle.appendChild(deleteButton);
    cardText.appendChild(centerButton);
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(cardText);
    cardDiv.appendChild(cardBodyDiv);

    cardDiv.id = planet.getName() + '-route-card';
    this.routeItemsContainer.appendChild(cardDiv);
  }

  private createRouteJumpCard(jumps: number) {
    const cardDiv = document.createElement('div');
    cardDiv.className =
      'text-center my-auto d-flex flex-column align-items-center text-white';

    const arrowDiv = document.createElement('div');
    arrowDiv.textContent = '→';

    const jumpsDiv = document.createElement('div');
    jumpsDiv.textContent = `${jumps} Jumps`;

    cardDiv.appendChild(arrowDiv);
    cardDiv.appendChild(jumpsDiv);
    this.routeItemsContainer.appendChild(cardDiv);
  }
}

export { ActionBarHandler };
