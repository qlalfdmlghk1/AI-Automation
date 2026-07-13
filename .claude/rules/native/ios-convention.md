# iOS Convention

> 이 문서는 iOS 컨벤션 변경 시 함께 업데이트합니다.

이 파일은 iOS 프로젝트의 Swift / Objective-C 개발 컨벤션을 정의합니다.
MVVM / MVC / MVP 아키텍처별 차이점을 구분하여 안내합니다.

> 각 섹션에서 **[Swift]**, **[Obj-C]** 표기가 있는 항목은 해당 언어에만 적용됩니다.
> 표기가 없는 항목은 **공통**입니다.

---

## 적용 대상

- **대상**: iOS 네이티브 앱 프로젝트 (Swift / Objective-C)
- **아키텍처**: MVVM / MVP / MVC (프로젝트별 채택)
- **최소 지원**: Swift 5.9+ / Xcode 15+ (상세는 [13. 빌드 환경](#13-빌드-환경-참고) 참고)
- **보안**: 민감정보 처리·네트워크 보안 등은 팀 보안 정본을 우선 따른다 → [보안 정본 참조](#보안-정본-참조)

---

## 1. 아키텍처

### 1.1 아키텍처 패턴 비교

| 항목 | MVVM | MVP | MVC |
|------|------|-----|-----|
| View | ViewController / SwiftUI View | ViewController | ViewController |
| 중간 레이어 | ViewModel | Presenter | Controller (ViewController 겸임) |
| View ↔ 중간 연결 | Combine / RxSwift / async-await / 클로저 바인딩 | Protocol 콜백 | 직접 참조 |
| 생명주기 인식 | ViewModel은 View 생명주기 비의존 | Presenter가 수동 관리 | 없음 |
| 테스트 용이성 | 높음 | 높음 | 낮음 |

### 1.2 MVVM 패키지 구조

```
{Project}/
├── App/
│   ├── AppDelegate.swift
│   ├── SceneDelegate.swift
│   └── {Project}App.swift          # SwiftUI 진입점
├── Data/
│   ├── Network/
│   │   ├── APIService.swift         # URLSession / Moya 기반 API 정의
│   │   ├── APIEndpoint.swift        # 엔드포인트 enum
│   │   └── NetworkManager.swift     # 네트워크 클라이언트
│   ├── Repository/
│   │   └── {Feature}Repository.swift
│   ├── DataSource/
│   │   ├── {Feature}RemoteDataSource.swift
│   │   └── {Feature}LocalDataSource.swift
│   ├── Model/
│   │   ├── Request/                 # Encodable 요청 모델
│   │   └── Response/                # Decodable 응답 모델
│   └── Local/
│       ├── KeychainManager.swift
│       └── UserDefaultsManager.swift
├── Domain/                          # (선택) Clean Architecture 적용 시
│   ├── Entity/
│   ├── UseCase/
│   └── RepositoryProtocol/
├── Presentation/
│   └── {Feature}/
│       ├── {Feature}ViewController.swift   # UIKit
│       ├── {Feature}View.swift             # SwiftUI
│       ├── {Feature}ViewModel.swift
│       └── {Feature}Cell.swift
├── Common/
│   ├── Extension/
│   ├── Util/
│   ├── Protocol/
│   └── Constant/
└── Resource/
    ├── Assets.xcassets
    ├── LaunchScreen.storyboard
    └── Info.plist
```

**의존 방향 (강제)**:
```
View (ViewController / SwiftUI View) → ViewModel → Repository → DataSource / API
```
- View는 ViewModel만 참조
- ViewModel은 Repository만 참조
- **역방향 참조 금지**

### 1.3 MVP 패키지 구조

```
{Project}/
├── App/
├── Data/
│   ├── Network/
│   ├── Repository/
│   ├── DataSource/
│   ├── Model/
│   └── Local/
├── Presentation/
│   └── {Feature}/
│       ├── {Feature}ViewController.swift
│       ├── {Feature}Protocol.swift         # View + Presenter 프로토콜 정의
│       ├── {Feature}Presenter.swift
│       └── {Feature}Cell.swift
├── Common/
└── Resource/
```

**의존 방향 (강제)**:
```
View (ViewController) ←→ Presenter → Repository → DataSource / API
         (Protocol을 통해 연결)
```
- View와 Presenter는 Protocol을 통해서만 통신
- Presenter는 View의 구현체를 직접 참조하지 않음
- **Presenter에 UIKit/SwiftUI import 금지** (`UIViewController`, `UIView` 등)

### 1.4 MVC 패키지 구조

```
{Project}/
├── App/
├── Data/
│   ├── Network/
│   ├── Repository/
│   ├── Model/
│   └── Local/
├── Controller/
│   └── {Feature}/
│       ├── {Feature}ViewController.swift   # Controller 역할 겸임
│       └── {Feature}Cell.swift
├── View/                                   # (선택) 커스텀 뷰 분리 시
│   └── {Feature}View.swift
├── Common/
└── Resource/
```

**의존 방향 (강제)**:
```
ViewController (Controller) → Repository → DataSource / API
ViewController (Controller) → View (Storyboard / XIB / Code)
```
- ViewController가 Controller 역할을 겸하되, 데이터 처리는 Repository로 위임
- **ViewController에 네트워크/DB 호출 직접 작성 금지** → Repository를 통해 접근

---

## 2. 네이밍 컨벤션

### 2.1 클래스/구조체 네이밍 (강제)

#### 공통

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| ViewController | `{Feature}ViewController` | `OrderViewController`, `LoginViewController` |
| SwiftUI View | `{Feature}View` | `HomeView`, `SettingsView` |
| Cell (UIKit) | `{Feature}Cell` | `MenuCell`, `UserListCell` |
| Cell (SwiftUI) | `{Feature}Row` / `{Feature}Cell` | `MenuRow`, `OrderItemCell` |
| Repository | `{Feature}Repository` | `LoginRepository`, `OrderRepository` |
| DataSource | `{Feature}DataSource` | `LoginRemoteDataSource`, `UserLocalDataSource` |
| Model (요청) | `{Feature}Request` | `LoginRequest`, `OrderRequest` |
| Model (응답) | `{Feature}Response` | `LoginResponse`, `OrderResponse` |
| Util / Helper | `{기능}Util` | `DateUtil`, `NetworkUtil` |
| Manager / Service | `{기능}Manager` / `{기능}Service` | `KeychainManager`, `LocationService` |

#### 언어별

| 유형 | Swift | Obj-C |
|------|-------|-------|
| Enum | `{Feature}Type`, `{Feature}State` | `{Prefix}{Feature}Type` |
| Extension 파일 | `{Type}+{기능}.swift` (예: `String+Validation.swift`) | `{Type}+{기능}.h/.m` |
| Protocol | `{기능}able` / `{기능}Protocol` | `{Prefix}{기능}Protocol` / `{Prefix}{기능}Delegate` |
| 상수 | `enum` 네임스페이스 내 정의 | `extern NSString *const k{Name}` |

#### 아키텍처별

| 유형 | MVVM | MVP | MVC |
|------|------|-----|-----|
| 중간 레이어 | `{Feature}ViewModel` | `{Feature}Presenter` | (ViewController 겸임) |
| 프로토콜 | `{Feature}ViewModelProtocol` (선택) | `{Feature}ViewProtocol` / `{Feature}PresenterProtocol` | - |
| 공유 상태 | `SharedViewModel` / `@EnvironmentObject` | - | - |

### 2.2 함수 네이밍 (강제)

> **Swift API Design Guidelines** 준수: 사용 시점의 명확성(clarity at the point of use)을 최우선으로 합니다.

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| 데이터 조회 | `fetch{Data}()` / `get{Data}()` | `fetchOrderStatus()`, `getUserList()` |
| 데이터 저장 | `save{Data}()` | `saveUserCredentials()` |
| 데이터 삭제 | `delete{Data}()` / `remove{Data}()` | `deleteCartItem()`, `removeToken()` |
| 데이터 수정 | `update{Data}()` | `updateOrderStatus()` |
| API 요청 | `request{Action}()` / `fetch{Data}()` | `requestLogin()`, `fetchOrders()` |
| 이벤트 핸들러 | `{event}Tapped` / `did{Event}` / `handle{Event}` | `loginButtonTapped()`, `didSelectItem()` |
| Boolean 반환 | `is{State}` / `has{Property}` / `can{Action}` | `isLoggedIn`, `hasPermission`, `canEdit` |
| UI 초기화 | `configure{Component}()` / `setup{Component}()` | `configureTableView()`, `setupNavigationBar()` |
| 팩토리 | `make{Object}()` | `makeOrderCell()`, `makeViewModel()` |

#### Swift API Design Guidelines 핵심 규칙

```swift
// ✅ 부작용 없는 함수: 명사형 (값을 반환)
let sorted = items.sorted()
let distance = point.distance(to: origin)

// ✅ 부작용 있는 함수: 동사형 (상태를 변경)
items.sort()
array.append(newItem)

// ✅ 전치사를 사용한 인자 레이블
func move(to point: CGPoint)
func convert(_ value: Int, to unit: Unit)

// ❌ 불필요한 단어 반복 금지
func removeItem(_ item: Item)      // ❌
func remove(_ item: Item)          // ✅

// ✅ 첫 번째 인자가 문맥상 명확하면 레이블 생략
func contains(_ element: Element) -> Bool
func append(_ newElement: Element)
```

### 2.3 변수 네이밍 (강제)

| 유형 | Swift | Obj-C |
|------|-------|-------|
| 일반 변수 | camelCase | camelCase |
| @Published (private) | camelCase (접근제어로 구분) | - |
| 상수 | camelCase (`let`) | `k` prefix + PascalCase |
| static 상수 | camelCase (`static let`) | UPPER_SNAKE_CASE |
| Boolean | `is/has/can/should` prefix | `is/has/can/should` prefix |
| Delegate | `weak var delegate` | `weak` / `assign` |
| Closure 프로퍼티 | `on{Event}` / `{action}Handler` | - |

#### [Swift] 상수 네임스페이스 (강제)

```swift
// ✅ enum 네임스페이스
enum Constant {
    static let maxRetryCount = 3
    static let animationDuration: TimeInterval = 0.3
}

enum Metric {
    static let defaultPadding: CGFloat = 16
    static let cornerRadius: CGFloat = 8
}

// ❌ 전역 상수 금지
let kMaxRetryCount = 3  // ❌
```

### 2.4 리소스 네이밍 (강제)

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| Asset Image | `{type}_{description}` (snake_case) | `ic_cart`, `bg_login_header` |
| Color (Asset) | `{description}` (camelCase 또는 semantic) | `primaryBlue`, `textGray`, `backgroundDefault` |
| Storyboard | `{Feature}.storyboard` | `Order.storyboard`, `Login.storyboard` |
| XIB | `{Feature}Cell.xib` / `{Feature}View.xib` | `MenuCell.xib`, `HeaderView.xib` |
| Localizable | `{feature}.{description}` | `"order.title"`, `"login.errorMessage"` |
| Font | `{FontFamily}-{Weight}` | `Pretendard-Bold`, `SFPro-Regular` |

---

## 3. 상태 관리 (아키텍처별)

### 3.1 MVVM

#### [Swift] Combine 패턴

```swift
import Combine

final class OrderViewModel: ObservableObject {
    // MARK: - Output
    @Published private(set) var orderStatus: OrderStatus?
    @Published private(set) var isLoading = false
    @Published private(set) var errorMessage: String?

    // MARK: - Dependencies
    private let repository: OrderRepositoryProtocol
    private var cancellables = Set<AnyCancellable>()

    init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    // MARK: - Input
    func fetchOrderStatus(orderId: Int) {
        isLoading = true
        errorMessage = nil

        repository.getOrderStatus(orderId: orderId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] status in
                    self?.orderStatus = status
                }
            )
            .store(in: &cancellables)
    }
}
```

#### [Swift] async/await 패턴 (권장 — 신규 프로젝트)

```swift
@MainActor
final class OrderViewModel: ObservableObject {
    @Published private(set) var uiState: UiState = .idle

    private let repository: OrderRepositoryProtocol

    init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    func fetchOrderStatus(orderId: Int) {
        Task {
            uiState = .loading
            do {
                let status = try await repository.getOrderStatus(orderId: orderId)
                uiState = .success(status)
            } catch {
                uiState = .error(error.localizedDescription)
            }
        }
    }
}

enum UiState {
    case idle
    case loading
    case success(OrderStatus)
    case error(String)
}
```

#### [Swift] RxSwift 패턴 (RxSwift/RxCocoa 기반 프로젝트)

> ViewModel은 `Input` / `Output` 구조체로 의존성을 명시한다.
> View의 이벤트(`Input`)를 받아 가공된 상태(`Output`)를 방출하는 단방향 흐름을 따른다.

```swift
import RxSwift
import RxCocoa

final class OrderViewModel {
    // MARK: - Input / Output
    struct Input {
        let viewDidLoad: Observable<Void>
        let refreshTriggered: Observable<Void>
    }

    struct Output {
        let orderStatus: Driver<OrderStatus?>
        let isLoading: Driver<Bool>
        let errorMessage: Signal<String>
    }

    // MARK: - Dependencies
    private let repository: OrderRepositoryProtocol
    private let disposeBag = DisposeBag()

    init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    // MARK: - Transform
    func transform(input: Input) -> Output {
        let loadingRelay = BehaviorRelay<Bool>(value: false)
        let errorRelay = PublishRelay<String>()

        let orderStatus = Observable
            .merge(input.viewDidLoad, input.refreshTriggered)
            .do(onNext: { loadingRelay.accept(true) })
            .flatMapLatest { [repository] _ -> Observable<OrderStatus?> in
                repository.getOrderStatus(orderId: 1)
                    .map { Optional($0) }
                    .do(
                        onError: { error in errorRelay.accept(error.localizedDescription) },
                        onDispose: { loadingRelay.accept(false) }
                    )
                    .catchAndReturn(nil)
            }
            .asDriver(onErrorJustReturn: nil)

        return Output(
            orderStatus: orderStatus,
            isLoading: loadingRelay.asDriver(),
            errorMessage: errorRelay.asSignal()
        )
    }
}
```

#### RxSwift 필수 규칙 (강제)

| 규칙 | 내용 |
|------|------|
| 구독 해제 | 모든 구독은 `DisposeBag`에 저장 → 객체 해제 시 자동 dispose |
| 메모리 관리 | 클로저 캡처는 `[weak self]`, 의존성만 필요 시 `[repository]` 등 명시 캡처 |
| UI 바인딩 | View 바인딩에는 에러를 방출하지 않는 `Driver` / `Signal` (RxCocoa) 사용 |
| 상태 보관 | 가변 상태는 `BehaviorRelay`, 이벤트는 `PublishRelay` 사용 (`Variable`은 deprecated → 금지) |
| 스레드 | UI 갱신은 `.observe(on: MainScheduler.instance)` 또는 `Driver`/`Signal`로 보장 |
| Subject 노출 | `PublishSubject`/`BehaviorSubject`를 외부에 노출 금지 → `Relay` 또는 `Observable`로 캡슐화 |

#### 바인딩 관찰 (강제)

**SwiftUI**
```swift
struct OrderView: View {
    @StateObject private var viewModel = OrderViewModel(repository: OrderRepository())

    var body: some View {
        Group {
            switch viewModel.uiState {
            case .idle:
                EmptyView()
            case .loading:
                ProgressView()
            case .success(let status):
                OrderStatusView(status: status)
            case .error(let message):
                ErrorView(message: message)
            }
        }
        .onAppear {
            viewModel.fetchOrderStatus(orderId: 1)
        }
    }
}
```

**UIKit + Combine**
```swift
final class OrderViewController: UIViewController {
    private let viewModel: OrderViewModel
    private var cancellables = Set<AnyCancellable>()

    init(viewModel: OrderViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        bindViewModel()
        viewModel.fetchOrderStatus(orderId: 1)
    }

    private func bindViewModel() {
        viewModel.$orderStatus
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                self?.updateUI(with: status)
            }
            .store(in: &cancellables)

        viewModel.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isLoading in
                isLoading ? self?.showLoading() : self?.hideLoading()
            }
            .store(in: &cancellables)
    }
}
```

**UIKit + RxSwift**
```swift
final class OrderViewController: UIViewController {
    private let viewModel: OrderViewModel
    private let disposeBag = DisposeBag()

    init(viewModel: OrderViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        bindViewModel()
    }

    private func bindViewModel() {
        let input = OrderViewModel.Input(
            viewDidLoad: .just(()),
            refreshTriggered: refreshControl.rx.controlEvent(.valueChanged).asObservable()
        )
        let output = viewModel.transform(input: input)

        output.orderStatus
            .drive(onNext: { [weak self] status in
                self?.updateUI(with: status)
            })
            .disposed(by: disposeBag)

        output.isLoading
            .drive(onNext: { [weak self] isLoading in
                isLoading ? self?.showLoading() : self?.hideLoading()
            })
            .disposed(by: disposeBag)

        output.errorMessage
            .emit(onNext: { [weak self] message in
                self?.showError(message)
            })
            .disposed(by: disposeBag)
    }
}
```

---

### 3.2 MVP: Protocol + Presenter 패턴 (강제)

```swift
// MARK: - Contract

protocol OrderViewProtocol: AnyObject {
    func showLoading()
    func hideLoading()
    func showOrderStatus(_ status: OrderStatus)
    func showError(_ message: String)
}

protocol OrderPresenterProtocol {
    func viewDidLoad()
    func fetchOrderStatus(orderId: Int)
}

// MARK: - Presenter

final class OrderPresenter: OrderPresenterProtocol {
    weak var view: OrderViewProtocol?
    private let repository: OrderRepositoryProtocol

    init(repository: OrderRepositoryProtocol) {
        self.repository = repository
    }

    func viewDidLoad() {
        fetchOrderStatus(orderId: 1)
    }

    func fetchOrderStatus(orderId: Int) {
        view?.showLoading()
        Task {
            do {
                let status = try await repository.getOrderStatus(orderId: orderId)
                await MainActor.run {
                    view?.hideLoading()
                    view?.showOrderStatus(status)
                }
            } catch {
                await MainActor.run {
                    view?.hideLoading()
                    view?.showError(error.localizedDescription)
                }
            }
        }
    }
}

// MARK: - ViewController

final class OrderViewController: UIViewController, OrderViewProtocol {
    private let presenter: OrderPresenterProtocol

    init(presenter: OrderPresenter) {
        self.presenter = presenter
        super.init(nibName: nil, bundle: nil)
        presenter.view = self
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    override func viewDidLoad() {
        super.viewDidLoad()
        presenter.viewDidLoad()
    }

    func showLoading() { /* ... */ }
    func hideLoading() { /* ... */ }
    func showOrderStatus(_ status: OrderStatus) { /* ... */ }
    func showError(_ message: String) { /* ... */ }
}
```

#### MVP 필수 규칙 (강제)

- Presenter의 View 프로퍼티는 반드시 `weak` 선언 → 순환 참조 방지
- Presenter에 `UIKit` / `SwiftUI` import 금지
- View 프로토콜은 반드시 `AnyObject`를 채택 (class-only protocol)
- View 프로토콜 메서드는 **UI 액션 단위**로 정의

---

### 3.3 MVC: ViewController 직접 제어 (강제)

```swift
final class OrderViewController: UIViewController {
    // MARK: - UI Components
    private let tableView = UITableView()
    private let loadingIndicator = UIActivityIndicatorView(style: .large)

    // MARK: - Properties
    private let repository = OrderRepository()
    private var orders: [Order] = []

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        configureUI()
        fetchOrders()
    }

    // MARK: - Data
    private func fetchOrders() {
        showLoading()
        Task {
            do {
                let result = try await repository.getOrders()
                orders = result
                tableView.reloadData()
            } catch {
                showError(error.localizedDescription)
            }
            hideLoading()
        }
    }

    // MARK: - UI
    private func configureUI() { /* ... */ }
    private func showLoading() { loadingIndicator.startAnimating() }
    private func hideLoading() { loadingIndicator.stopAnimating() }
    private func showError(_ message: String) { /* ... */ }
}
```

#### MVC 필수 규칙 (강제)

- 네트워크/DB 접근은 반드시 Repository를 통해 수행
- ViewController 내 메서드를 `MARK` 주석으로 **UI / Data / Action** 으로 명확히 분리
- ViewController 코드가 비대해지면 MVP 또는 MVVM 전환 검토

---

## 4. 네트워크 레이어

### 4.1 API Endpoint 정의 (강제)

```swift
enum APIEndpoint {
    case login(LoginRequest)
    case orderDetail(orderId: Int)
    case orderList(page: Int, size: Int)

    var path: String {
        switch self {
        case .login:                return "/auth/login"
        case .orderDetail(let id):  return "/orders/\(id)"
        case .orderList:            return "/orders"
        }
    }

    var method: HTTPMethod {
        switch self {
        case .login:       return .post
        case .orderDetail: return .get
        case .orderList:   return .get
        }
    }

    var parameters: Encodable? {
        switch self {
        case .login(let request):            return request
        case .orderList(let page, let size): return ["page": page, "size": size]
        default:                             return nil
        }
    }
}

enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}
```

### 4.2 Network Manager 구성 (강제)

```swift
final class NetworkManager {
    static let shared = NetworkManager()

    private let session: URLSession
    private let baseURL: String

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 10
        config.timeoutIntervalForResource = 30
        session = URLSession(configuration: config)
        baseURL = "https://example.com/api"
    }

    func request<T: Decodable>(_ endpoint: APIEndpoint) async throws -> T {
        let url = try buildURL(for: endpoint)
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = KeychainManager.shared.getAccessToken() {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let parameters = endpoint.parameters, endpoint.method != .get {
            request.httpBody = try JSONEncoder().encode(parameters)
        }

        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200...299).contains(httpResponse.statusCode) else {
            throw NetworkError.statusCode(httpResponse.statusCode)
        }

        return try JSONDecoder().decode(T.self, from: data)
    }
}
```

### 4.3 데이터 모델 정의 (강제)

```swift
// MARK: - Request
struct LoginRequest: Encodable {
    let email: String
    let password: String
}

// MARK: - Response
struct OrderResponse: Decodable {
    let orderId: Int
    let orderStatus: String
    let menuName: String

    enum CodingKeys: String, CodingKey {
        case orderId = "order_id"
        case orderStatus = "order_status"
        case menuName = "menu_name"
    }
}
```

- `Encodable` / `Decodable` / `Codable` 명시적 사용
- snake_case ↔ camelCase 변환은 `CodingKeys` 또는 `JSONDecoder.keyDecodingStrategy` 사용

### 4.4 결과 처리 (강제)

결과 타입은 **표준 라이브러리 `Swift.Result<Success, Failure>`를 기본**으로 사용한다.
표준 `Result`를 가리는 커스텀 전역 `enum Result` 정의는 **금지**한다.

```swift
// ✅ 표준 Result 사용 — 별도 타입 정의 불필요
func fetchOrder(id: Int) async -> Result<Order, NetworkError> { ... }

func fetchOrder(id: Int, completion: @escaping (Result<Order, NetworkError>) -> Void) { ... }

enum NetworkError: Error, LocalizedError {
    case invalidURL
    case invalidResponse
    case statusCode(Int)
    case decodingFailed
    case noConnection
    case unknown(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:           return "잘못된 URL입니다."
        case .invalidResponse:      return "서버 응답을 처리할 수 없습니다."
        case .statusCode(let code): return "서버 오류 (코드: \(code))"
        case .decodingFailed:       return "데이터 파싱에 실패했습니다."
        case .noConnection:         return "네트워크 연결을 확인해주세요."
        case .unknown(let error):   return error.localizedDescription
        }
    }
}
```

> **금지**: 전역 `enum Result<T>` 정의 → 표준 `Swift.Result`를 섀도잉하므로 사용 금지.
> 부득이하게 커스텀 결과 타입이 필요하면 이름을 **`NetworkResult`** 등으로 명확히 구분한다.

---

## 5. 비동기 처리

### 5.1 [Swift] async/await (권장 — iOS 15+)

#### Task 사용 규칙 (강제)

| 위치 | 사용 패턴 |
|------|----------|
| ViewController | `Task { }` (viewDidLoad 등에서) |
| ViewModel (@MainActor) | `Task { }` (이미 MainActor) |
| SwiftUI View | `.task { }` modifier |
| 백그라운드 작업 | `Task.detached(priority:)` |

- `Task` 취소 처리를 위해 프로퍼티로 저장하고 `deinit` 또는 `viewDidDisappear`에서 취소

```swift
final class OrderViewController: UIViewController {
    private var fetchTask: Task<Void, Never>?

    override func viewDidLoad() {
        super.viewDidLoad()
        fetchTask = Task {
            await viewModel.fetchOrders()
        }
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        fetchTask?.cancel()
    }
}
```

#### Actor 사용 규칙 (강제)

| 작업 유형 | 처리 방법 |
|-----------|----------|
| UI 업데이트 | `@MainActor` (ViewModel 클래스 또는 개별 메서드) |
| 네트워크 / 파일 I/O | async 함수 (자동으로 백그라운드) |
| 공유 상태 보호 | `actor` 타입 사용 |

```swift
@MainActor
final class OrderViewModel: ObservableObject {
    @Published private(set) var orders: [Order] = []

    func fetchOrders() async {
        do {
            // async 함수 호출 — 자동으로 백그라운드 실행
            let result = try await repository.getOrders()
            // @MainActor이므로 UI 업데이트 안전
            orders = result
        } catch {
            // 에러 처리
        }
    }
}
```

### 5.2 [Swift] Combine

```swift
final class OrderViewModel {
    @Published private(set) var orders: [Order] = []
    private var cancellables = Set<AnyCancellable>()

    func fetchOrders() {
        repository.getOrders()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.handleError(error)
                    }
                },
                receiveValue: { [weak self] orders in
                    self?.orders = orders
                }
            )
            .store(in: &cancellables)
    }
}
```

### 5.3 [Swift] RxSwift

> RxSwift/RxCocoa 기반 프로젝트에서 사용한다. 신규 프로젝트는 async/await를 우선 고려한다.

```swift
final class OrderViewModel {
    let orders: Driver<[Order]>
    private let disposeBag = DisposeBag()

    init(repository: OrderRepositoryProtocol, trigger: Observable<Void>) {
        orders = trigger
            .flatMapLatest { _ in
                repository.getOrders()          // Observable<[Order]>
                    .catchAndReturn([])
            }
            .asDriver(onErrorJustReturn: [])
    }
}
```

#### Rx 연산자 사용 규칙 (강제)

| 상황 | 연산자 |
|------|--------|
| 최신 요청만 유지 (이전 요청 취소) | `flatMapLatest` |
| 모든 요청 보존 (순서 무관) | `flatMap` |
| 1:1 값 변환 | `map` |
| 에러를 기본값으로 복구 | `catchAndReturn` / `catch` |
| 중복 이벤트 제거 | `distinctUntilChanged` |
| 입력 디바운스 (검색 등) | `debounce` / `throttle` |
| 부작용 (로깅, 로딩 토글) | `do(onNext:onError:)` |

- 구독은 반드시 `disposed(by: disposeBag)`로 관리한다.
- 무거운 작업은 `subscribe(on:)`, UI 갱신은 `observe(on: MainScheduler.instance)`로 스케줄러를 분리한다.

### 5.4 [Swift] GCD (레거시 / 단순 작업)

```swift
// ✅ 허용: 단순 딜레이, 간단한 백그라운드 작업
DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
    self.animateTransition()
}

DispatchQueue.global(qos: .userInitiated).async {
    let processed = self.processImage(data)
    DispatchQueue.main.async {
        self.imageView.image = processed
    }
}
```

### 5.5 금지된 비동기 패턴

| 금지 | 대안 |
|------|------|
| `DispatchQueue.main.sync` (메인 스레드에서 호출) | 데드락 위험 — 제거 |
| 중첩 GCD (3단계 이상) | async/await 또는 Combine / RxSwift |
| `Thread.sleep()` / `sleep()` | `Task.sleep(nanoseconds:)` |
| `OperationQueue` (단순 작업에) | async/await 또는 `Task` |
| `RxSwift.Variable` (deprecated) | `BehaviorRelay` / `PublishRelay` |
| Rx 구독 후 `disposeBag` 미저장 | `disposed(by:)`로 반드시 관리 (메모리 누수 방지) |
| `subscribe` 클로저 내 `self` 강한 캡처 | `[weak self]` 명시 캡처 |

---

## 6. UI 구성 (강제)

### 6.1 SwiftUI (iOS 14+)

```swift
struct OrderView: View {
    @StateObject private var viewModel: OrderViewModel

    init(viewModel: OrderViewModel) {
        _viewModel = StateObject(wrappedValue: viewModel)
    }

    var body: some View {
        List(viewModel.orders) { order in
            OrderRow(order: order)
        }
        .navigationTitle("주문 목록")
        .task {
            await viewModel.fetchOrders()
        }
    }
}
```

#### Property Wrapper 사용 규칙 (강제)

| Wrapper | 용도 | 소유권 |
|---------|------|--------|
| `@State` | View 내부 단순 상태 (Value Type) | View가 소유 |
| `@Binding` | 부모로부터 전달받은 상태 | 부모가 소유 |
| `@StateObject` | View가 생성하는 ObservableObject | View가 소유 (최초 1회 생성) |
| `@ObservedObject` | 외부에서 주입받는 ObservableObject | 외부가 소유 |
| `@EnvironmentObject` | 환경을 통해 주입되는 공유 객체 | 상위 View가 소유 |
| `@Environment` | 시스템 환경 값 (colorScheme 등) | 시스템 소유 |

```swift
// ❌ 외부 주입 객체에 @StateObject 사용
struct OrderView: View {
    @StateObject var viewModel: OrderViewModel  // ❌ 외부 주입인데 StateObject

// ✅ 외부 주입은 @ObservedObject
struct OrderView: View {
    @ObservedObject var viewModel: OrderViewModel  // ✅

// ✅ 내부 생성은 @StateObject
struct OrderView: View {
    @StateObject private var viewModel = OrderViewModel()  // ✅
```

### 6.2 UIKit — 코드 기반 UI (강제)

> Storyboard / XIB를 사용하는 프로젝트가 아니라면 코드 기반 UI를 기본으로 합니다.

```swift
final class OrderViewController: UIViewController {
    // MARK: - UI Components
    private let tableView: UITableView = {
        let table = UITableView()
        table.translatesAutoresizingMaskIntoConstraints = false
        table.register(OrderCell.self, forCellReuseIdentifier: OrderCell.identifier)
        return table
    }()

    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        configureUI()
        configureConstraints()
    }

    // MARK: - UI Setup
    private func configureUI() {
        view.backgroundColor = .systemBackground
        view.addSubview(tableView)
        tableView.delegate = self
        tableView.dataSource = self
    }

    private func configureConstraints() {
        NSLayoutConstraint.activate([
            tableView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }
}
```

#### UIKit 필수 규칙

- `translatesAutoresizingMaskIntoConstraints = false` 반드시 설정
- Auto Layout은 `NSLayoutConstraint.activate()` 일괄 활성화
- 셀 재사용 식별자는 `static let identifier` 패턴 사용

```swift
final class OrderCell: UITableViewCell {
    static let identifier = String(describing: OrderCell.self)
}
```

---

## 7. TableView / CollectionView (권장)

### 7.1 UIKit — DiffableDataSource (iOS 13+, 권장)

```swift
final class OrderViewController: UIViewController {
    private var dataSource: UITableViewDiffableDataSource<Section, Order>!

    enum Section { case main }

    private func configureDataSource() {
        dataSource = UITableViewDiffableDataSource(
            tableView: tableView
        ) { tableView, indexPath, order in
            guard let cell = tableView.dequeueReusableCell(
                withIdentifier: OrderCell.identifier,
                for: indexPath
            ) as? OrderCell else {
                return UITableViewCell()
            }
            cell.configure(with: order)
            return cell
        }
    }

    private func applySnapshot(orders: [Order], animating: Bool = true) {
        var snapshot = NSDiffableDataSourceSnapshot<Section, Order>()
        snapshot.appendSections([.main])
        snapshot.appendItems(orders)
        dataSource.apply(snapshot, animatingDifferences: animating)
    }
}
```

### 7.2 UIKit — Compositional Layout (iOS 13+, 권장)

```swift
private func createLayout() -> UICollectionViewLayout {
    let itemSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .estimated(80)
    )
    let item = NSCollectionLayoutItem(layoutSize: itemSize)

    let groupSize = NSCollectionLayoutSize(
        widthDimension: .fractionalWidth(1.0),
        heightDimension: .estimated(80)
    )
    let group = NSCollectionLayoutGroup.vertical(layoutSize: groupSize, subitems: [item])

    let section = NSCollectionLayoutSection(group: group)
    section.interGroupSpacing = 8
    section.contentInsets = NSDirectionalEdgeInsets(top: 16, leading: 16, bottom: 16, trailing: 16)

    return UICollectionViewCompositionalLayout(section: section)
}
```

### 7.3 SwiftUI — List / LazyVStack

```swift
struct OrderListView: View {
    @StateObject private var viewModel = OrderListViewModel()

    var body: some View {
        List {
            ForEach(viewModel.orders) { order in
                OrderRow(order: order)
            }
        }
        .refreshable {
            await viewModel.refresh()
        }
    }
}
```

---

## 8. 코드 스타일

### 8.1 공통 규칙 (강제)

- 들여쓰기: 4 spaces (탭 금지)
- 한 줄 최대 길이: 120자
- 와일드카드 import 금지 → 명시적 import
- `MARK` 주석으로 섹션 구분

```swift
// MARK: - Properties
// MARK: - Lifecycle
// MARK: - UI Setup
// MARK: - Actions
// MARK: - Private Methods
```

### 8.2 [Swift] 고유 규칙

- **Swift API Design Guidelines** 준수
- `self` 생략 (캡처 리스트, 모호한 경우에만 명시)
- `var` 남용 금지 → 가능한 `let` 사용
- `guard let` 을 사용한 early return 우선
- `final class` 기본 사용 (상속이 필요한 경우에만 `class`)
- Value Type (`struct`, `enum`) 우선 사용 → 참조 시맨틱이 필요할 때만 `class`
- 접근 제어자 명시 (특히 `private`, `private(set)`)
- 후행 클로저 (trailing closure) 적극 활용
- 프로토콜 채택은 `extension`으로 분리

```swift
// ✅ Optional 처리
guard let user = fetchUser() else { return }
let displayName = user.nickname ?? "Unknown"

// ✅ 접근 제어
final class OrderViewModel {
    private(set) var orders: [Order] = []
    private let repository: OrderRepositoryProtocol
}

// ✅ 프로토콜 채택을 extension으로 분리
final class OrderViewController: UIViewController {
    // 본체 코드
}

extension OrderViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) { /* ... */ }
}

extension OrderViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { orders.count }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell { /* ... */ }
}
```

### 8.3 [Obj-C] 고유 규칙

- **Apple Coding Guidelines for Cocoa** 준수
- 3글자 프로젝트 prefix 사용 (예: `SKT`, `APP`)
- 중괄호: K&R 스타일 (같은 줄에 열기)
- `nullable`, `nonnull` 어노테이션 사용 (`NS_ASSUME_NONNULL_BEGIN` / `END`)
- 프로퍼티는 `nonatomic` 명시
- Category 파일: `{Class}+{기능}.h/.m`

#### 클래스 내 선언 순서 (강제)

```objc
@interface SKTOrderViewController ()
// 1. @property (private)
// 2. IBOutlet (Storyboard 사용 시)
@end

@implementation SKTOrderViewController
// 1. dealloc
// 2. 생명주기 메서드 (viewDidLoad → viewWillAppear → ... → viewDidDisappear)
// 3. public 메서드
// 4. private 메서드
// 5. delegate 메서드
// 6. accessor (필요 시)
@end
```

### 8.4 [Swift] 클래스/구조체 내 선언 순서 (강제)

```swift
final class OrderViewController: UIViewController {
    // 1. 타입 프로퍼티 (static let/var)
    // 2. IBOutlet (Storyboard 사용 시)
    // 3. UI 컴포넌트 (코드 기반 UI)
    // 4. 프로퍼티 (let → var 순)
    // 5. 초기화 (init / deinit)
    // 6. 생명주기 메서드 (viewDidLoad → viewWillAppear → ...)
    // 7. UI 설정 메서드 (configure / setup)
    // 8. Action 메서드 (@objc, @IBAction)
    // 9. Private 메서드
}

// 10. Protocol 채택 (extension으로 분리)
extension OrderViewController: UITableViewDelegate { /* ... */ }
```

---

## 9. 로컬 저장소

| 상황 | 권장 |
|------|------|
| 민감정보 (토큰, 비밀번호) | Keychain (필수) |
| 간단한 설정/플래그 | UserDefaults |
| 구조화된 대량 데이터 | Core Data / SwiftData (iOS 17+) / Realm |
| 파일 캐시 | FileManager (Caches 디렉토리) |

#### Keychain 래퍼 예시

```swift
final class KeychainManager {
    static let shared = KeychainManager()
    private init() {}

    func save(_ data: Data, for key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]

        SecItemDelete(query as CFDictionary)
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }

    func load(for key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess else { return nil }
        return result as? Data
    }
}
```

#### UserDefaults 래퍼 예시

```swift
@propertyWrapper
struct UserDefault<T> {
    let key: String
    let defaultValue: T
    let container: UserDefaults = .standard

    var wrappedValue: T {
        get { container.object(forKey: key) as? T ?? defaultValue }
        set { container.set(newValue, forKey: key) }
    }
}

enum AppSettings {
    @UserDefault(key: "is_onboarding_completed", defaultValue: false)
    static var isOnboardingCompleted: Bool

    @UserDefault(key: "selected_language", defaultValue: "ko")
    static var selectedLanguage: String
}
```

> **주의**: UserDefaults에 민감정보(토큰, 비밀번호, 개인정보) 저장 금지 → Keychain 사용

---

## 10. 금지 사항

### 10.1 공통 금지

- 하드코딩된 문자열/숫자 금지 → `Localizable.strings`, `Asset`, 상수 `enum` 사용
- ViewController에 비즈니스 로직 직접 작성 금지 (MVC 제외)
- 와일드카드 import 금지

### 10.2 [Swift] 금지

- `!` (force unwrap) 남용 금지 → `guard let` / `if let` / `??` 사용
  - 허용 예외: `IBOutlet`, 테스트 코드, 컴파일 타임에 보장된 값 (`UIImage(named:)` 등은 가급적 회피)
- `var` 남용 금지 → 가능한 `let` 사용
- `Any` / `AnyObject` 남용 금지 → 제네릭 또는 프로토콜 사용
- `class` 기본 사용 금지 → `final class` 또는 `struct` 우선
- 전역 변수/함수 금지 → 타입 내부 또는 `enum` 네임스페이스 사용
- `NSNotification` 이름 문자열 직접 사용 금지 → `Notification.Name` extension 사용

### 10.3 [Obj-C] 금지

- `instancetype` 대신 구체 클래스 반환 금지 → `instancetype` 사용
- Category에서 프로퍼티 추가 시 `objc_setAssociatedObject` 남용 금지
- `@synthesize` 직접 사용 금지 (자동 합성)

### 10.4 아키텍처별 금지

| 아키텍처 | 금지 사항 |
|----------|-----------|
| MVVM | View에서 Repository 직접 참조 금지 |
| MVVM | ViewModel에서 UIKit/SwiftUI import 금지 (View 참조 금지) |
| MVP | Presenter에 UIKit/SwiftUI import 금지 (`UIViewController`, `UIView` 등) |
| MVP | View 구현체에서 Repository 직접 참조 금지 |
| MVC | ViewController에서 API/DB 직접 호출 금지 (Repository 경유) |

---

## 11. 테스트

### 11.1 테스트 프레임워크

| 유형 | 프레임워크 |
|------|-----------|
| 단위 테스트 | XCTest / Swift Testing (iOS 16+) |
| UI 테스트 | XCUITest |
| 비동기 테스트 | XCTestExpectation / async 테스트 |
| RxSwift 테스트 | RxTest (`TestScheduler`) / RxBlocking |
| Mock | Protocol Mock (수동) / Mockolo / Sourcery |

### 11.2 테스트 파일 위치

```
{Project}Tests/           # 단위 테스트
{Project}UITests/         # UI 테스트
```

### 11.3 테스트 우선순위

| 우선순위 | 대상 |
|----------|------|
| 1 | ViewModel / Presenter (비즈니스 로직) |
| 2 | Repository (데이터 레이어) |
| 3 | Util / Extension (유틸리티) |
| 4 | UI (XCUITest) |

### 11.4 테스트 네이밍 (강제)

```swift
// XCTest — 패턴: test_{메서드명}_{조건}_{기대결과}
func test_login_withValidCredentials_shouldReturnSuccess() { /* ... */ }
func test_fetchOrders_whenNetworkError_shouldShowErrorState() { /* ... */ }

// Swift Testing (iOS 16+)
@Test("유효한 자격증명으로 로그인 시 성공을 반환해야 한다")
func loginWithValidCredentials() async throws { /* ... */ }
```

### 11.5 비동기 테스트 패턴

```swift
// async/await 테스트
func test_fetchOrders_shouldReturnOrders() async throws {
    let viewModel = OrderViewModel(repository: MockOrderRepository())
    await viewModel.fetchOrders()
    XCTAssertFalse(viewModel.orders.isEmpty)
}

// Combine 테스트
func test_orderStatus_shouldUpdate() {
    let expectation = expectation(description: "orderStatus updated")
    var cancellables = Set<AnyCancellable>()

    viewModel.$orderStatus
        .dropFirst()
        .sink { status in
            XCTAssertNotNil(status)
            expectation.fulfill()
        }
        .store(in: &cancellables)

    viewModel.fetchOrderStatus(orderId: 1)
    wait(for: [expectation], timeout: 5.0)
}

// RxSwift 테스트 (RxTest)
func test_orders_whenViewDidLoad_shouldEmitOrders() {
    let scheduler = TestScheduler(initialClock: 0)
    let disposeBag = DisposeBag()
    let trigger = scheduler.createColdObservable([.next(10, ())]).asObservable()
    let viewModel = OrderViewModel(repository: MockOrderRepository(), trigger: trigger)

    let observer = scheduler.createObserver([Order].self)
    viewModel.orders.drive(observer).disposed(by: disposeBag)

    scheduler.start()

    XCTAssertEqual(observer.events.last?.value.element?.isEmpty, false)
}
```

---

## 12. Swift ↔ Objective-C 혼용 시 주의사항

| 상황 | 규칙 |
|------|------|
| Swift에서 Obj-C 호출 | `{Project}-Bridging-Header.h`에 import 추가 |
| Obj-C에서 Swift 호출 | `#import "{Project}-Swift.h"`, Swift 클래스에 `@objc` 명시 |
| Obj-C 호환 필요 | `@objcMembers` 또는 개별 `@objc` 사용 |
| Enum | Obj-C 호환 시 `@objc enum` + `Int` raw value 필수 |
| Optional | Obj-C에서 Swift Optional은 `nullable` / `nonnull` 매핑 확인 |
| Protocol | Obj-C 호환 시 `@objc protocol` 선언 |
| Struct | Obj-C에서 사용 불가 → `class`로 변환 필요 |
| Closure | Obj-C의 Block과 자동 브릿징 (`@convention(block)`) |

---

## 13. 빌드 환경 (참고)

프로젝트별 Xcode 설정에 정의하며, 아래는 권장 최소 기준입니다.

| 항목 | 권장 최소값 | 비고 |
|------|------------|------|
| Deployment Target | 프로젝트별 결정 | 사용자 기기 분포 고려 (일반적으로 최신 -2) |
| Swift Version | 5.9+ | Xcode 15+ 기준 |
| Xcode | 최신 안정 버전 | App Store 제출 정책 준수 |
| Swift Concurrency | Strict Concurrency Checking = Complete | 신규 프로젝트 권장 |
| ATS | 기본 활성 상태 유지 | `NSAllowsArbitraryLoads` = NO (필수) |

---

## 보안 정본 참조

본 문서의 보안 관련 항목(Keychain, ATS, 민감정보 저장 등)은 팀 보안 정본을 기준으로 하며,
충돌 시 **보안 정본이 우선**한다.

- 팀 보안 정본: `.claude/rules/security-compliance.md` (iOS 섹션)
- 핵심 요약:
  - 토큰·비밀번호 등 민감정보는 **Keychain 저장 필수** (UserDefaults 금지)
  - ATS 활성 유지, `NSAllowsArbitraryLoads = NO` (필요 시 도메인 예외 최소화)
  - 릴리스 빌드에서 민감정보 `print`/로그 출력 금지
