# Android Convention

> 이 문서는 Android 컨벤션 변경 시 함께 업데이트합니다.

이 파일은 Android 프로젝트의 Kotlin / Java 개발 컨벤션을 정의합니다.
MVVM / MVC / MVP 아키텍처별 차이점을 구분하여 안내합니다.

> 각 섹션에서 **[Kotlin]**, **[Java]** 표기가 있는 항목은 해당 언어에만 적용됩니다.
> 표기가 없는 항목은 **공통**입니다.

---

## 적용 대상

- 팀의 모든 Android 프로젝트 (Kotlin / Java)
- 아키텍처(MVVM / MVP / MVC)·언어별 표기가 있는 항목은 해당 범위에만 적용
- **보안 판정 기준의 정본**은 `security-compliance.md`(ux-team-standard 플러그인 배포)이며, 본 문서와 충돌 시 정본을 따릅니다 (14절 참고)

---

## 1. 아키텍처

### 1.1 아키텍처 패턴 비교

| 항목 | MVVM | MVP | MVC |
|------|------|-----|-----|
| View | Activity / Fragment | Activity / Fragment | Activity / Fragment |
| 중간 레이어 | ViewModel | Presenter | Controller (Activity 겸임) |
| View ↔ 중간 연결 | LiveData / StateFlow 관찰 | Interface 콜백 | 직접 참조 |
| 생명주기 인식 | ViewModel이 자동 관리 | Presenter가 수동 관리 | 없음 |
| 테스트 용이성 | 높음 | 높음 | 낮음 |

### 1.2 MVVM 패키지 구조

```
com.{company}.{project}/
├── base/
│   ├── BaseActivity
│   └── BaseViewModel
├── data/
│   ├── api/                    # Retrofit API 인터페이스
│   ├── repository/             # Repository 클래스
│   ├── datasource/             # DataSource (Local / Remote)
│   ├── model/                  # 데이터 모델 (request / response)
│   └── local/                  # DataStore, Room 등 로컬 저장소
├── ui/
│   └── {feature}/
│       ├── {Feature}Activity
│       ├── {Feature}Fragment
│       ├── {Feature}ViewModel
│       └── {Feature}Adapter
└── util/
```

**의존 방향 (강제)**:
```
View (Activity/Fragment) → ViewModel → Repository → DataSource / API
```
- View는 ViewModel만 참조
- ViewModel은 Repository만 참조
- **역방향 참조 금지**

### 1.3 MVP 패키지 구조

```
com.{company}.{project}/
├── base/
│   ├── BaseActivity
│   ├── BasePresenter
│   └── BaseView                  # View 인터페이스 기반
├── data/
│   ├── api/
│   ├── repository/
│   ├── datasource/
│   ├── model/
│   └── local/
├── ui/
│   └── {feature}/
│       ├── {Feature}Activity
│       ├── {Feature}Fragment
│       ├── {Feature}Contract      # View + Presenter 인터페이스 정의
│       ├── {Feature}Presenter
│       └── {Feature}Adapter
└── util/
```

**의존 방향 (강제)**:
```
View (Activity/Fragment) ←→ Presenter → Repository → DataSource / API
         (Contract 인터페이스를 통해 연결)
```
- View와 Presenter는 Contract 인터페이스를 통해서만 통신
- Presenter는 View의 구현체를 직접 참조하지 않음
- **Presenter에 Android Framework 클래스 import 금지** (`Context`, `View` 등)

### 1.4 MVC 패키지 구조

```
com.{company}.{project}/
├── base/
│   └── BaseActivity
├── data/
│   ├── api/
│   ├── repository/
│   ├── model/
│   └── local/
├── ui/
│   └── {feature}/
│       ├── {Feature}Activity       # Controller 역할 겸임
│       ├── {Feature}Fragment
│       └── {Feature}Adapter
├── controller/                     # (선택) 별도 Controller 분리 시
│   └── {Feature}Controller
└── util/
```

**의존 방향 (강제)**:
```
Activity (Controller) → Repository → DataSource / API
Activity (Controller) → View (Layout XML)
```
- Activity가 Controller 역할을 겸하되, 데이터 처리는 Repository로 위임
- **Activity에 네트워크/DB 호출 직접 작성 금지** → Repository를 통해 접근

---

## 2. 네이밍 컨벤션

### 2.1 클래스 네이밍 (강제)

#### 공통

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| Activity | `{Feature}Activity` | `OrderActivity`, `LoginActivity` |
| Fragment | `{Feature}Fragment` | `HomeFragment`, `SettingsFragment` |
| Adapter | `{Feature}Adapter` | `MenuAdapter`, `UserListAdapter` |
| Repository | `{Feature}Repository` | `LoginRepository`, `OrderRepository` |
| DataSource | `{Feature}DataSource` | `LoginRemoteDataSource`, `UserLocalDataSource` |
| Data Class (요청) | `{Feature}Request` | `LoginRequest`, `OrderRequest` |
| Data Class (응답) | `{Feature}Response` | `LoginResponse`, `OrderResponse` |
| Util / Helper | `{기능}Utils` | `DateUtils`, `NetworkUtils` |

#### 언어별

| 유형 | Kotlin | Java |
|------|--------|------|
| Sealed/Enum | `Result`, `UiState` | - |
| 확장 함수 파일 | `{기능}Ext` (예: `StringExt`) | - |
| Interface | - | `{Feature}Listener`, `Loadable` |
| 상수 클래스 | `companion object` 내 정의 | `{Feature}Constants` |

#### 아키텍처별

| 유형 | MVVM | MVP | MVC |
|------|------|-----|-----|
| 중간 레이어 | `{Feature}ViewModel` | `{Feature}Presenter` | (Activity 겸임) |
| Factory | `{Feature}ViewModelFactory` | - | - |
| 인터페이스 | - | `{Feature}Contract` | - |
| 공유 상태 | `SharedViewModel` | - | - |

### 2.2 함수 네이밍 (강제)

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| 데이터 조회 | `get{Data}()` | `getOrderStatus()`, `getUserList()` |
| 데이터 저장 | `save{Data}()` | `saveUserCredentials()` |
| 데이터 삭제 | `delete{Data}()` | `deleteCartItem()` |
| 데이터 수정 | `update{Data}()` | `updateOrderStatus()` |
| API 요청 | `request{Action}()` 또는 `fetch{Data}()` | `requestLogin()`, `fetchOrders()` |
| 이벤트 핸들러 | `on{Event}()` | `onLoginClick()`, `onItemSelected()` |
| Boolean 반환 | `is{State}()` / `has{Property}()` | `isLoggedIn()`, `hasPermission()` |
| UI 초기화 | `setup{Component}()` / `init{Component}()` | `setupRecyclerView()`, `initToolbar()` |

### 2.3 변수 네이밍 (강제)

| 유형 | Kotlin | Java |
|------|--------|------|
| 일반 변수 | camelCase | camelCase |
| LiveData (private) | `_camelCase` | `mutable{Name}` |
| LiveData (public) | camelCase | camelCase |
| StateFlow (private) | `_camelCase` | - |
| StateFlow (public) | camelCase | - |
| 상수 | `companion object` 내 UPPER_SNAKE_CASE | `static final` UPPER_SNAKE_CASE |
| Boolean | `is/has/can` prefix | `is/has/can` prefix |

### 2.4 리소스 네이밍 (강제)

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| Layout (Activity) | `activity_{feature}.xml` | `activity_order.xml` |
| Layout (Fragment) | `fragment_{feature}.xml` | `fragment_home.xml` |
| Layout (Item) | `item_{feature}.xml` | `item_menu.xml`, `item_cart.xml` |
| Layout (Dialog) | `dialog_{feature}.xml` | `dialog_confirm.xml` |
| Layout (Include) | `layout_{description}.xml` | `layout_toolbar.xml`, `layout_empty.xml` |
| Drawable | `{type}_{description}.xml` | `bg_round_button.xml`, `ic_cart.xml` |
| String | `{feature}_{description}` | `order_title`, `login_error_message` |
| Color | `{description}` | `primary_blue`, `text_gray` |
| Dimen | `{type}_{description}` | `margin_default`, `text_size_title` |
| Anim | `{type}_{direction}.xml` | `fade_in.xml`, `slide_left.xml` |

---

## 3. 상태 관리 (아키텍처별)

### 3.1 MVVM

#### [Kotlin] LiveData 패턴

```kotlin
class OrderViewModel : ViewModel() {
    private val _orderStatus = MutableLiveData<OrderStatus>()
    val orderStatus: LiveData<OrderStatus> = _orderStatus

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    fun fetchOrderStatus(orderId: Int) {
        _isLoading.value = true
        viewModelScope.launch {
            try {
                _orderStatus.value = repository.getOrderStatus(orderId)
            } finally {
                _isLoading.value = false
            }
        }
    }
}
```

#### [Kotlin] StateFlow 패턴 (권장 — 신규 프로젝트)

```kotlin
class OrderViewModel : ViewModel() {
    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    fun fetchOrderStatus(orderId: Int) {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val result = repository.getOrderStatus(orderId)
                _uiState.value = UiState.Success(result)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message)
            }
        }
    }
}

sealed class UiState {
    object Loading : UiState()
    data class Success(val data: OrderStatus) : UiState()
    data class Error(val message: String?) : UiState()
}
```

#### [Java] LiveData 패턴

```java
public class OrderViewModel extends ViewModel {
    private final MutableLiveData<OrderStatus> mutableOrderStatus = new MutableLiveData<>();
    public final LiveData<OrderStatus> orderStatus = mutableOrderStatus;

    private final MutableLiveData<Boolean> mutableIsLoading = new MutableLiveData<>();
    public final LiveData<Boolean> isLoading = mutableIsLoading;

    public void fetchOrderStatus(int orderId) {
        mutableIsLoading.setValue(true);
        repository.getOrderStatus(orderId, new Callback<OrderStatus>() {
            @Override
            public void onSuccess(OrderStatus result) {
                mutableOrderStatus.postValue(result);
                mutableIsLoading.postValue(false);
            }

            @Override
            public void onError(String message) {
                mutableIsLoading.postValue(false);
            }
        });
    }
}
```

#### LiveData / StateFlow 관찰 (강제)

**[Kotlin]**
```kotlin
// LiveData — Activity
viewModel.orderStatus.observe(this) { status -> updateUI(status) }

// LiveData — Fragment (viewLifecycleOwner 필수)
viewModel.orderStatus.observe(viewLifecycleOwner) { status -> updateUI(status) }

// StateFlow — Fragment
viewLifecycleOwner.lifecycleScope.launch {
    viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
        viewModel.uiState.collect { state -> updateUI(state) }
    }
}
```

**[Java]**
```java
// Activity
viewModel.orderStatus.observe(this, status -> { updateUI(status); });

// Fragment (getViewLifecycleOwner 필수)
viewModel.orderStatus.observe(getViewLifecycleOwner(), status -> { updateUI(status); });
```

---

### 3.2 MVP: Contract + Presenter 패턴 (강제)

**[Kotlin]**
```kotlin
interface OrderContract {
    interface View {
        fun showLoading()
        fun hideLoading()
        fun showOrderStatus(status: OrderStatus)
        fun showError(message: String)
    }

    interface Presenter {
        fun attachView(view: View)
        fun detachView()
        fun fetchOrderStatus(orderId: Int)
    }
}

class OrderPresenter(
    private val repository: OrderRepository
) : OrderContract.Presenter {
    private var view: OrderContract.View? = null

    override fun attachView(view: OrderContract.View) { this.view = view }
    override fun detachView() { view = null }

    override fun fetchOrderStatus(orderId: Int) {
        view?.showLoading()
        repository.getOrderStatus(orderId,
            onSuccess = { status ->
                view?.hideLoading()
                view?.showOrderStatus(status)
            },
            onError = { message ->
                view?.hideLoading()
                view?.showError(message)
            }
        )
    }
}

class OrderActivity : BaseActivity(), OrderContract.View {
    private lateinit var presenter: OrderContract.Presenter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        presenter = OrderPresenter(OrderRepository())
        presenter.attachView(this)
    }

    override fun onDestroy() {
        presenter.detachView()
        super.onDestroy()
    }

    override fun showLoading() { /* ... */ }
    override fun hideLoading() { /* ... */ }
    override fun showOrderStatus(status: OrderStatus) { /* ... */ }
    override fun showError(message: String) { /* ... */ }
}
```

**[Java]**
```java
public interface OrderContract {
    interface View {
        void showLoading();
        void hideLoading();
        void showOrderStatus(OrderStatus status);
        void showError(String message);
    }

    interface Presenter {
        void attachView(View view);
        void detachView();
        void fetchOrderStatus(int orderId);
    }
}

public class OrderPresenter implements OrderContract.Presenter {
    private OrderContract.View view;
    private final OrderRepository repository;

    public OrderPresenter(OrderRepository repository) { this.repository = repository; }

    @Override public void attachView(OrderContract.View view) { this.view = view; }
    @Override public void detachView() { this.view = null; }

    @Override
    public void fetchOrderStatus(int orderId) {
        if (view != null) view.showLoading();
        repository.getOrderStatus(orderId, new Callback<OrderStatus>() {
            @Override
            public void onSuccess(OrderStatus result) {
                if (view != null) { view.hideLoading(); view.showOrderStatus(result); }
            }
            @Override
            public void onError(String message) {
                if (view != null) { view.hideLoading(); view.showError(message); }
            }
        });
    }
}
```

#### MVP 필수 규칙 (강제)

- `onDestroy()`에서 반드시 `detachView()` 호출 → 메모리 릭 방지
- Presenter에 `android.*` 패키지 import 금지
- View 인터페이스 메서드는 **UI 액션 단위**로 정의
- **[Java]** Presenter에서 View 호출 전 반드시 `view != null` 체크

---

### 3.3 MVC: Activity 직접 제어 (강제)

**[Kotlin]**
```kotlin
class OrderActivity : BaseActivity() {
    private lateinit var binding: ActivityOrderBinding
    private val repository = OrderRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderBinding.inflate(layoutInflater)
        setContentView(binding.root)
        fetchOrderStatus(orderId = 1)
    }

    private fun fetchOrderStatus(orderId: Int) {
        showLoading()
        lifecycleScope.launch {
            try {
                val result = repository.getOrderStatus(orderId)
                updateUI(result)
            } catch (e: Exception) {
                showError(e.message)
            } finally {
                hideLoading()
            }
        }
    }
}
```

**[Java]**
```java
public class OrderActivity extends BaseActivity {
    private ActivityOrderBinding binding;
    private final OrderRepository repository = new OrderRepository();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOrderBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        fetchOrderStatus(1);
    }

    private void fetchOrderStatus(int orderId) {
        showLoading();
        repository.getOrderStatus(orderId, new Callback<OrderStatus>() {
            @Override
            public void onSuccess(OrderStatus result) {
                runOnUiThread(() -> { hideLoading(); updateUI(result); });
            }
            @Override
            public void onError(String message) {
                runOnUiThread(() -> { hideLoading(); showError(message); });
            }
        });
    }
}
```

#### MVC 필수 규칙 (강제)

- 네트워크/DB 접근은 반드시 Repository를 통해 수행
- Activity 내 메서드를 **UI 관련**과 **데이터 처리 관련**으로 명확히 분리
- Activity 코드가 비대해지면 MVP 또는 MVVM 전환 검토

---

## 4. 네트워크 레이어

### 4.1 Retrofit API 정의 (강제)

**[Kotlin]** — `suspend` 함수로 정의
```kotlin
interface ApiService {
    @POST("auth/login")
    suspend fun requestLogin(@Body params: LoginRequest): Response<LoginResponse>

    @GET("orders/{orderId}")
    suspend fun getOrderDetail(@Path("orderId") orderId: Int): Response<OrderDetailResponse>

    @GET("orders")
    suspend fun getOrderList(@Query("page") page: Int, @Query("size") size: Int): Response<OrderListResponse>
}
```

**[Java]** — `Call<T>` 기반으로 정의
```java
public interface ApiService {
    @POST("auth/login")
    Call<LoginResponse> requestLogin(@Body LoginRequest params);

    @GET("orders/{orderId}")
    Call<OrderDetailResponse> getOrderDetail(@Path("orderId") int orderId);

    @GET("orders")
    Call<OrderListResponse> getOrderList(@Query("page") int page, @Query("size") int size);
}
```

### 4.2 Retrofit Client 구성 (강제)

**[Kotlin]**
```kotlin
object RetrofitClient {
    private const val BASE_URL = "https://example.com/api/"
    private const val TIMEOUT_SECONDS = 10L

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor())
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BODY
                        else HttpLoggingInterceptor.Level.NONE
            })
            .build()
    }

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL).client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build().create(ApiService::class.java)
    }
}
```

**[Java]**
```java
public class RetrofitClient {
    private static final String BASE_URL = "https://example.com/api/";
    private static final long TIMEOUT_SECONDS = 10L;
    private static volatile ApiService apiService;

    private RetrofitClient() {}

    public static ApiService getApi() {
        if (apiService == null) {
            synchronized (RetrofitClient.class) {
                if (apiService == null) {
                    OkHttpClient client = new OkHttpClient.Builder()
                        .connectTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                        .readTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                        .writeTimeout(TIMEOUT_SECONDS, TimeUnit.SECONDS)
                        .addInterceptor(new AuthInterceptor())
                        .build();
                    apiService = new Retrofit.Builder()
                        .baseUrl(BASE_URL).client(client)
                        .addConverterFactory(GsonConverterFactory.create())
                        .build().create(ApiService.class);
                }
            }
        }
        return apiService;
    }
}
```

### 4.3 데이터 모델 정의 (강제)

**[Kotlin]**
```kotlin
data class OrderResponse(
    @SerializedName("orderId") @Expose val orderId: Int,
    @SerializedName("orderStatus") @Expose val orderStatus: String,
    @SerializedName("menuName") @Expose val menuName: String
)
```

**[Java]**
```java
public class OrderResponse {
    @SerializedName("orderId") @Expose private int orderId;
    @SerializedName("orderStatus") @Expose private String orderStatus;

    public int getOrderId() { return orderId; }
    public String getOrderStatus() { return orderStatus; }
}
```

### 4.4 결과 처리 (강제)

**[Kotlin]** — Sealed Class
```kotlin
sealed class Result<out T : Any> {
    data class Success<out T : Any>(val data: T) : Result<T>()
    data class Error(val exception: Exception) : Result<Nothing>()
    object Loading : Result<Nothing>()
}
```

**[Java]** — Callback Interface
```java
public interface ResultCallback<T> {
    void onSuccess(T data);
    void onError(String message);
}
```

---

## 5. 비동기 처리

### 5.1 [Kotlin] 코루틴

#### Scope 사용 규칙 (강제)

| 위치 | 사용할 Scope |
|------|-------------|
| Activity / Fragment | `lifecycleScope.launch` |
| ViewModel | `viewModelScope.launch` |
| Service / Worker | `CoroutineScope(Dispatchers.IO + SupervisorJob())` |

- `GlobalScope` 사용 금지
- ViewModel 내 비동기 작업은 반드시 `viewModelScope` 사용

#### Dispatcher 규칙 (강제)

| 작업 유형 | Dispatcher |
|-----------|-----------|
| UI 업데이트 | `Dispatchers.Main` (기본값) |
| 네트워크 / 파일 I/O / DB | `Dispatchers.IO` |
| CPU 연산 (정렬, 파싱 등) | `Dispatchers.Default` |

```kotlin
private val _orders = MutableLiveData<List<Order>>()
val orders: LiveData<List<Order>> = _orders

private val _isLoading = MutableLiveData<Boolean>()
val isLoading: LiveData<Boolean> = _isLoading

private val _error = MutableLiveData<String?>()
val error: LiveData<String?> = _error

fun fetchOrders() {
    viewModelScope.launch {
        _isLoading.value = true
        try {
            val result = withContext(Dispatchers.IO) { repository.getOrders() }
            _orders.value = result
        } catch (e: Exception) {
            _error.value = e.message
        } finally {
            _isLoading.value = false
        }
    }
}
```

#### 예외 처리 (권장)

```kotlin
private val _data = MutableLiveData<Data>()
val data: LiveData<Data> = _data

private val exceptionHandler = CoroutineExceptionHandler { _, throwable ->
    _error.value = throwable.message
}

fun fetchData() {
    viewModelScope.launch(exceptionHandler) {
        _data.value = repository.getData()
    }
}
```

### 5.2 [Java] Executor / Handler

코루틴을 사용할 수 없으므로 `Executor` + `Handler` 또는 Retrofit `enqueue`를 사용합니다.

#### Executor 패턴 (강제)

```java
public class OrderViewModel extends ViewModel {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private final MutableLiveData<List<Order>> mutableOrders = new MutableLiveData<>();
    public final LiveData<List<Order>> orders = mutableOrders;

    private final MutableLiveData<Boolean> mutableIsLoading = new MutableLiveData<>();
    public final LiveData<Boolean> isLoading = mutableIsLoading;

    private final MutableLiveData<String> mutableError = new MutableLiveData<>();
    public final LiveData<String> error = mutableError;

    public void fetchOrders() {
        mutableIsLoading.setValue(true);
        executor.execute(() -> {
            try {
                List<Order> result = repository.getOrdersSync();
                mainHandler.post(() -> {
                    mutableOrders.setValue(result);
                    mutableIsLoading.setValue(false);
                });
            } catch (Exception e) {
                mainHandler.post(() -> {
                    mutableError.setValue(e.getMessage());
                    mutableIsLoading.setValue(false);
                });
            }
        });
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        executor.shutdown();
    }
}
```

#### postValue vs setValue (강제)

| 메서드 | 호출 위치 | 설명 |
|--------|-----------|------|
| `setValue()` | Main Thread에서만 | 즉시 반영 |
| `postValue()` | 어디서든 가능 | Main Thread로 전달 후 반영 |

#### 금지된 비동기 패턴

| 금지 | 대안 |
|------|------|
| `AsyncTask` (deprecated) | `Executor` + `Handler` |
| `new Thread().start()` | `Executor` |
| `runOnUiThread` 남용 | `LiveData.postValue()` |

---

## 6. UI 구현 방식 — XML vs Compose

UI를 **XML 레이아웃 + View Binding**으로 구현할지, **Jetpack Compose**로 구현할지에 대한 기준과 컨벤션을 정의합니다.

### 6.1 선택 기준 (강제)

> **이 프로젝트의 표준은 `XML 레이아웃 + View Binding`입니다.**
> 현재 코드베이스는 단일 Activity + WebView 기반 하이브리드 쉘로, 네이티브 UI 비중이 작아 XML로 통일되어 있습니다.
> 아래 Compose 관련 컨벤션(6.3)은 **신규 화면/모듈에 Compose를 도입하기로 팀이 결정한 경우에 한해** 적용합니다.

| 상황 | 권장 방식 | 비고 |
|------|-----------|------|
| 기존 화면 수정/유지보수 | **XML + View Binding** | 기존 방식 유지, 부분 Compose 전환 금지 |
| WebView 호스팅 / 하이브리드 쉘 | **XML + View Binding** | 본 프로젝트의 기본 구조 |
| 단순 정적 레이아웃 | **XML + View Binding** | 기존 패턴과 일관성 우선 |
| 복잡한 동적 UI · 상태 기반 렌더링이 많은 신규 화면 | Compose (팀 합의 후) | 도입 시 모듈 단위로 분리 |
| 한 화면 내 XML ↔ Compose 혼용 | **지양** | 불가피할 경우 `ComposeView` / `AndroidView`로 경계 명확화 |

**필수 규칙**
- 방식 선택은 **개인 판단이 아닌 팀 합의**로 결정 (신규 도입은 별도 확인)
- 한 화면(Activity/Fragment) 내에서 XML과 Compose를 **임의 혼용 금지**
- 기존 XML 화면을 요청 범위 밖에서 **임의로 Compose 전환 금지** (Observe, Don't Auto-Fix)

---

### 6.2 [XML] View Binding (강제)

모든 Activity/Fragment에서 View Binding을 사용합니다. `findViewById` 사용 금지.

**[Kotlin]**
```kotlin
// Activity
class OrderActivity : BaseActivity() {
    private lateinit var binding: ActivityOrderBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}

// Fragment
class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null  // 메모리 릭 방지 필수
    }
}
```

**[Java]**
```java
// Activity
public class OrderActivity extends BaseActivity {
    private ActivityOrderBinding binding;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityOrderBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
    }
}

// Fragment
public class HomeFragment extends Fragment {
    private FragmentHomeBinding binding;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;  // 메모리 릭 방지 필수
    }
}
```

---

### 6.3 [Compose] 컨벤션 (신규 도입 시 적용)

> 아래 규칙은 **Compose를 신규 도입한 모듈/화면에 한해** 적용됩니다. 기존 XML 화면에는 6.2를 따릅니다.

#### 6.3.1 네이밍 (강제)

| 유형 | 네이밍 규칙 | 예시 |
|------|-------------|------|
| Composable 함수 | PascalCase (명사형) | `OrderScreen`, `LoginButton`, `UserListItem` |
| 화면 단위 Composable | `{Feature}Screen` | `HomeScreen`, `SettingsScreen` |
| 재사용 컴포넌트 | `{역할}{Component}` | `PrimaryButton`, `EmptyView` |
| Stateful ↔ Stateless 분리 | Stateful: `{Feature}Route` / Stateless: `{Feature}Screen` | `OrderRoute` → `OrderScreen` |
| Preview 함수 | `{Composable}Preview` | `OrderScreenPreview` |
| UI 상태 모델 | `{Feature}UiState` | `OrderUiState` |

- Composable 함수는 `Unit`을 반환하며 **부수효과 없는 순수 UI 선언**을 지향
- `@Composable` 함수명은 동사형 금지 → **명사형** (UI는 "무엇"이지 "행동"이 아님)
- 미리보기는 반드시 `@Preview` + `private fun`으로 작성

#### 6.3.2 상태 관리 / 호이스팅 (강제)

- **상태 호이스팅(State Hoisting)**: 상태는 가능한 상위로 끌어올리고, 하위 Composable은 **상태 + 콜백(`onXxx`)을 파라미터로 전달**받는 Stateless 형태로 작성
- ViewModel과는 `StateFlow` + `collectAsStateWithLifecycle()`로 연결 (생명주기 인식)
- `remember` / `rememberSaveable`로 UI 로컬 상태 보관, 비즈니스 상태는 ViewModel에 위치
- 화면 단위는 **Stateful(Route) ↔ Stateless(Screen)** 로 분리

```kotlin
// Stateful — ViewModel과 연결
@Composable
fun OrderRoute(viewModel: OrderViewModel = viewModel()) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    OrderScreen(
        uiState = uiState,
        onRefresh = viewModel::fetchOrderStatus,
    )
}

// Stateless — 상태 + 콜백만 받음 (Preview/테스트 용이)
@Composable
fun OrderScreen(
    uiState: OrderUiState,
    onRefresh: () -> Unit,
) {
    when (uiState) {
        is OrderUiState.Loading -> LoadingView()
        is OrderUiState.Success -> OrderContent(uiState.data, onRefresh)
        is OrderUiState.Error -> ErrorView(uiState.message, onRefresh)
    }
}

@Preview(showBackground = true)
@Composable
private fun OrderScreenPreview() {
    OrderScreen(uiState = OrderUiState.Loading, onRefresh = {})
}
```

#### 6.3.3 구조 / 부수효과 (강제)

- 부수효과는 전용 API 사용: `LaunchedEffect`, `DisposableEffect`, `SideEffect` (Composable 본문에서 직접 호출 금지)
- 리스트는 `LazyColumn` / `LazyRow` 사용 + `key`로 항목 식별 (RecyclerView Adapter 대체)
- `Modifier`는 **항상 첫 번째 선택 파라미터**로 노출하고 기본값 `Modifier` 지정
- 테마/색상/치수는 `MaterialTheme` 토큰 사용 (XML의 `colors.xml`/`dimens.xml` 역할)
- XML 화면에 Compose를 끼워 넣을 때는 `ComposeView`, Compose에 기존 View를 넣을 때는 `AndroidView`로 경계 명시

#### 6.3.4 [Compose] 금지 사항

| 금지 | 대안 |
|------|------|
| Composable 본문에서 부수효과 직접 실행 | `LaunchedEffect` 등 Effect API |
| Composable에 `Context`/`Activity` 직접 보관 | `LocalContext.current` 필요 시점에만 |
| 하위 Composable에서 ViewModel 직접 참조 | 상태 호이스팅(상위에서 주입) |
| 하드코딩 색상/치수 | `MaterialTheme` 토큰 |
| `Modifier` 파라미터 누락 | 재사용 컴포넌트는 `Modifier` 파라미터 필수 |
| 한 화면 내 XML ↔ Compose 임의 혼용 | `ComposeView` / `AndroidView`로 경계 분리 |

---

## 7. RecyclerView Adapter (권장)

### ListAdapter 패턴

**[Kotlin]**
```kotlin
class ItemAdapter(
    private val onItemClick: (Item) -> Unit
) : ListAdapter<Item, ItemAdapter.ViewHolder>(ItemDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val binding = ItemLayoutBinding.inflate(LayoutInflater.from(parent.context), parent, false)
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) { holder.bind(getItem(position)) }

    inner class ViewHolder(private val binding: ItemLayoutBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: Item) {
            binding.title.text = item.title
            binding.root.setOnClickListener { onItemClick(item) }
        }
    }

    private class ItemDiffCallback : DiffUtil.ItemCallback<Item>() {
        override fun areItemsTheSame(oldItem: Item, newItem: Item) = oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Item, newItem: Item) = oldItem == newItem
    }
}
```

**[Java]**
```java
public class ItemAdapter extends ListAdapter<Item, ItemAdapter.ViewHolder> {
    private final OnItemClickListener listener;

    public interface OnItemClickListener { void onItemClick(Item item); }

    public ItemAdapter(OnItemClickListener listener) {
        super(new ItemDiffCallback());
        this.listener = listener;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemLayoutBinding binding = ItemLayoutBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) { holder.bind(getItem(position)); }

    class ViewHolder extends RecyclerView.ViewHolder {
        private final ItemLayoutBinding binding;
        ViewHolder(ItemLayoutBinding binding) { super(binding.getRoot()); this.binding = binding; }
        void bind(Item item) {
            binding.title.setText(item.getTitle());
            binding.getRoot().setOnClickListener(v -> listener.onItemClick(item));
        }
    }

    private static class ItemDiffCallback extends DiffUtil.ItemCallback<Item> {
        @Override public boolean areItemsTheSame(@NonNull Item o, @NonNull Item n) { return o.getId() == n.getId(); }
        @Override public boolean areContentsTheSame(@NonNull Item o, @NonNull Item n) { return o.equals(n); }
    }
}
```

---

## 8. 코드 스타일

### 8.1 공통 규칙 (강제)

- 들여쓰기: 4 spaces (탭 금지)
- 한 줄 최대 길이: 120자
- 와일드카드 import 금지 → 명시적 import

### 8.2 [Kotlin] 고유 규칙

- **Kotlin 공식 코딩 스타일** 준수
- 후행 쉼표 (trailing comma) 사용 권장
- `!!` (non-null assertion) 사용 최소화 → `?.let { }`, `?:` 활용
- `var` 남용 금지 → 가능한 `val` 사용
- 단순 데이터 보관은 반드시 `data class`
- 반복 유틸 코드는 확장 함수로 분리

```kotlin
// Null Safety
val userName = user?.name ?: "Unknown"
user?.let { binding.userName.text = it.name }

// 단일 표현식 함수
fun isLoggedIn(): Boolean = accessToken.isNotEmpty()

// Scope 함수 활용
val intent = Intent(this, DetailActivity::class.java).apply {
    putExtra("id", itemId)
    addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
}

// 확장 함수
fun View.visible() { visibility = View.VISIBLE }
fun View.gone() { visibility = View.GONE }
```

### 8.3 [Java] 고유 규칙

- **Google Java Style Guide** 준수
- 중괄호: K&R 스타일 (같은 줄에 열기)
- `@NonNull`, `@Nullable` 어노테이션 적극 사용
- `public` 필드 직접 노출 금지 → getter/setter 사용
- Raw type 사용 금지 → 제네릭 타입 명시
- 데이터 보관 클래스는 `equals()`, `hashCode()` 반드시 오버라이드

#### 접근 제어자 순서 (강제)

순서: `public` → `protected` → `default(package-private)` → `private`
수식어: `static` → `final` → `transient` → `volatile`

#### 클래스 내 선언 순서 (강제)

```java
public class ExampleActivity extends BaseActivity {
    // 1. 상수 (static final)
    // 2. static 변수
    // 3. 멤버 변수
    // 4. 생성자
    // 5. 생명주기 메서드 (onCreate → onStart → ... → onDestroy)
    // 6. public 메서드
    // 7. private 메서드
    // 8. inner class
}
```

#### 상수 관리 (강제)

```java
public final class ApiConstants {
    public static final String BASE_URL = "https://example.com/api/";
    public static final int TIMEOUT_SECONDS = 10;
    private ApiConstants() {}
}
```

---

## 9. 로컬 저장소

| 상황 | 권장 |
|------|------|
| 신규 프로젝트 | DataStore 사용 |
| 기존 SharedPreferences 유지보수 | 그대로 유지 (마이그레이션 비용 고려) |
| 대량 / 관계형 데이터 | Room DB 사용 |
| 토큰·비밀번호 등 민감정보 | `EncryptedSharedPreferences` 또는 Android Keystore (평문 저장 금지) |

> ⚠️ **민감정보 평문 저장 금지 (강제)**
> 토큰·비밀번호·개인정보는 평문 DataStore / SharedPreferences에 저장하지 않습니다.
> → `EncryptedSharedPreferences` 또는 Android Keystore 사용 (정본: `security-compliance.md`)

**[Kotlin] DataStore 예시** — 비민감 설정 값
```kotlin
class AppPreferences(private val dataStore: DataStore<Preferences>) {
    val isDarkMode: Flow<Boolean> = dataStore.data.map { it[DARK_MODE_KEY] ?: false }

    suspend fun saveDarkMode(enabled: Boolean) {
        dataStore.edit { it[DARK_MODE_KEY] = enabled }
    }

    companion object {
        private val DARK_MODE_KEY = booleanPreferencesKey("dark_mode")
    }
}
```

**[Kotlin] 민감정보 저장 예시** — `EncryptedSharedPreferences`

> `androidx.security:security-crypto` 의존성이 필요합니다. 미사용 프로젝트에 신규 추가할 때는 팀 합의(새 라이브러리 지양 원칙) 후 진행하고, 인증 SDK가 토큰 저장을 자체 관리하는 경우(예: T ID SDK / Blockstore 위임)에는 앱에서 별도 저장하지 않는 것이 우선입니다.
```kotlin
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

val securePrefs = EncryptedSharedPreferences.create(
    context,
    "secure_prefs",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
)

securePrefs.edit { putString(KEY_ACCESS_TOKEN, token) }
```

---

## 10. 금지 사항

### 10.1 공통 금지

- `findViewById` 사용 금지 → View Binding 사용
- 하드코딩된 문자열/숫자 금지 → `strings.xml`, `dimens.xml`, 상수 사용
- Activity/Fragment에 비즈니스 로직 직접 작성 금지 (MVC 제외)
- 와일드카드 import 금지

### 10.2 [Kotlin] 금지

- `GlobalScope` 사용 금지
- `!!` (non-null assertion) 남용 금지
- `var` 남용 금지

### 10.3 [Java] 금지

- `AsyncTask` 사용 금지 (deprecated) → Executor 사용
- `new Thread().start()` 사용 금지 → Executor 사용
- `public` 필드 직접 노출 금지 → getter/setter 사용
- Raw type 사용 금지 → 제네릭 타입 명시

### 10.4 아키텍처별 금지

| 아키텍처 | 금지 사항 |
|----------|-----------|
| MVVM | View에서 Repository 직접 참조 금지 |
| MVVM | ViewModel에서 View (Activity/Fragment) 참조 금지 |
| MVP | Presenter에 Android Framework import 금지 (`Context`, `View`, `Activity` 등) |
| MVP | View 구현체에서 Repository 직접 참조 금지 |
| MVC | Activity에서 API/DB 직접 호출 금지 (Repository 경유) |

---

## 11. 테스트

### 11.1 테스트 프레임워크

| 유형 | Kotlin | Java |
|------|--------|------|
| 단위 테스트 | JUnit4 + MockK (또는 Mockito) | JUnit4 + Mockito |
| UI 테스트 | Espresso | Espresso |
| 비동기 테스트 | kotlinx-coroutines-test | `InstantTaskExecutorRule` |

### 11.2 테스트 파일 위치

```
src/test/java/         # 단위 테스트
src/androidTest/java/  # Instrumented 테스트 (UI 테스트)
```

### 11.3 테스트 우선순위

| 우선순위 | 대상 |
|----------|------|
| 1 | ViewModel / Presenter (비즈니스 로직) |
| 2 | Repository (데이터 레이어) |
| 3 | Util / Extension (유틸리티) |
| 4 | UI (Espresso) |

### 11.4 테스트 네이밍 (강제)

**[Kotlin]**
```kotlin
@Test
fun `로그인 성공 시 토큰이 저장되어야 한다`() { /* ... */ }
```

**[Java]** — 패턴: `{메서드명}_{조건}_{기대결과}`
```java
@Test
public void login_withValidCredentials_shouldReturnSuccess() { /* ... */ }
```

---

## 12. Java ↔ Kotlin 혼용 시 주의사항

| 상황 | 규칙 |
|------|------|
| Kotlin에서 Java 호출 | `@JvmStatic`, `@JvmField`, `@JvmOverloads` 어노테이션 활용 |
| Java에서 Kotlin 호출 | `companion object`는 `ClassName.Companion.method()` 또는 `@JvmStatic` 사용 |
| Null Safety | Kotlin 코드의 `@Nullable` / `@NonNull` 어노테이션 확인 필수 |
| Data Class | Java에서 Kotlin data class 사용 시 `component1()`, `copy()` 등 활용 가능 |
| 확장 함수 | Java에서 호출 시 `{FileName}Kt.{methodName}()` 형태 |
| SAM 변환 | Java 인터페이스를 Kotlin 람다로 변환 가능 |

---

## 13. 빌드 환경 (참고)

프로젝트별 `build.gradle`에 정의하며, 아래는 권장 최소 기준입니다.

| 항목 | 권장 최소값 | 비고 |
|------|------------|------|
| compileSdk | 34+ | 최신 API 사용 |
| minSdk | 프로젝트별 결정 | 사용자 기기 분포 고려 |
| targetSdk | compileSdk과 동일 | Google Play 정책 준수 |
| Java Version | 17 | AGP 8.x 기준 |

---

## 14. 보안 (강제)

> 보안 판정 기준의 **정본**은 `security-compliance.md`(ux-team-standard 플러그인 배포)입니다.
> 아래는 Android 필수 항목 요약이며, 본 문서와 충돌 시 정본을 따릅니다.

- **민감정보 평문 저장 금지**: 토큰·비밀번호·개인정보는 `EncryptedSharedPreferences` / Android Keystore 사용 (9절 참고)
- **keystore·서명 키·API 시크릿 하드코딩 금지**: 서명 정보는 환경변수 / CI 시크릿으로 주입
- **cleartext 통신 차단**: `network_security_config`로 HTTP(cleartext) 차단, 필요 시 인증서 핀닝 적용
- **릴리스 빌드 Logcat 민감정보 출력 금지**: 토큰·개인정보 로그 금지, Logging Interceptor는 디버그 빌드 한정
