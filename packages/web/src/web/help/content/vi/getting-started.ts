import { type Category, h, note, p, see, steps, ul } from "../../types";

export const gettingStarted: Category = {
  slug: "getting-started",
  title: "Bắt đầu",
  summary: "Mới dùng GeoCliks? Hãy chọn lối đi đúng với vai trò của bạn.",
  icon: "Rocket",
  sections: [
    {
      title: "Kiến thức cơ bản",
      articles: [
        {
          slug: "what-is-geocliks",
          title: "GeoCliks là gì?",
          summary:
            "Bằng chứng hiện trường chứng minh được: mỗi tấm ảnh mang theo thời điểm đã xác thực, toạ độ GPS và địa chỉ đường phố.",
          keywords: [
            "tổng quan",
            "giới thiệu",
            "sản phẩm",
            "overview",
            "about",
            "product",
            "introduction",
          ],
          body: [
            p(
              "GeoCliks là công cụ ghi nhận bằng ảnh và video dành cho đội ngũ hiện trường. Bạn chụp lại công việc bằng điện thoại, và mỗi hình ảnh đều được đóng dấu thời điểm chụp, nơi chụp, và địa chỉ đường phố mà toạ độ đó dẫn tới. Dấu này vừa in thẳng vào ảnh, vừa được ghi lại riêng để về sau còn kiểm tra được.",
            ),
            p(
              "Mục đích không phải là ảnh đẹp hơn. Mục đích là khi khách hàng, công ty bảo hiểm hay toà án hỏi tấm ảnh này có đúng như bạn nói hay không, bạn có sẵn câu trả lời không phụ thuộc vào lời của bạn.",
            ),
            h("Bạn nhận được gì"),
            ul(
              "Ảnh và video có hình mờ kèm thời điểm đã xác thực, toạ độ GPS và địa chỉ.",
              "Một mã ảnh duy nhất trên mỗi hình ảnh mà ai cũng kiểm tra được, không cần tài khoản.",
              "Không gian nhóm: nơi làm việc chung để văn phòng thấy hình ảnh của đội ngay khi tải lên.",
              "Dự án, chế độ bản đồ, so sánh trước và sau, cùng bản xuất PDF, Excel, ZIP và KMZ chỉ với một lần bấm.",
              "Tuyến đường giao hàng: lên lịch một ngày cho tài xế, cho họ lên đường, và đóng từng điểm dừng bằng một tấm ảnh làm bằng chứng.",
            ),
            h("Ai đang dùng"),
            ul(
              "Đội xây dựng và thợ thi công ghi lại tiến độ và lúc bàn giao.",
              "Công việc khắc phục sự cố và bảo hiểm, nơi trình tự thời gian chính là toàn bộ lập luận.",
              "Đội điện nước, viễn thông và kiểm định cần có vị trí trên mọi hồ sơ.",
              "Hoạt động giao hàng cần bằng chứng gói hàng thật sự đã tới nơi.",
            ),
            note(
              "GeoCliks chạy được khi ngoại tuyến. Hình ảnh xếp hàng chờ ngay trên máy và tự tải lên khi có sóng trở lại, giữ nguyên thời điểm chụp gốc.",
            ),
            see("getting-started/create-your-account", "verify/what-is-a-photo-code"),
          ],
        },
        {
          slug: "create-your-account",
          title: "Tạo tài khoản",
          summary:
            "Đăng ký trong ứng dụng hoặc trên web — cùng một tài khoản dùng được ở mọi nơi.",
          keywords: [
            "đăng ký",
            "tài khoản mới",
            "email",
            "sign up",
            "register",
            "new account",
          ],
          body: [
            p(
              "Một tài khoản GeoCliks dùng chung cho ứng dụng di động, trang web và ứng dụng máy tính. Tạo ở đâu tiện thì tạo; đăng ký ở một nơi khác không có nghĩa là bạn đang lập tài khoản thứ hai.",
            ),
            h("Đăng ký"),
            steps(
              "Mở ứng dụng GeoCliks, hoặc vào geocliks.com rồi chọn Đăng ký.",
              "Nhập tên, email công việc và mật khẩu, hoặc tiếp tục bằng Google.",
              "Kiểm tra hộp thư để tìm email xác thực rồi mở đường liên kết trong đó.",
              "Chọn ngôn ngữ. Bạn có thể đổi lại sau trong hồ sơ.",
            ),
            note(
              "Hãy dùng email công việc chứ đừng dùng email cá nhân. Khi ai đó mời bạn vào một không gian làm việc, họ sẽ gửi lời mời tới địa chỉ mà họ biết.",
            ),
            h("Nếu email xác thực không tới"),
            ul(
              "Chờ hai phút rồi kiểm tra thư mục spam hoặc thư rác.",
              "Xem lại địa chỉ bạn đã gõ — thiếu một chữ cái là nguyên nhân thường gặp.",
              "Yêu cầu gửi lại đường liên kết mới từ màn hình đăng nhập.",
            ),
            see("getting-started/for-solo-user", "troubleshoot/cant-sign-in"),
          ],
        },
        {
          slug: "install-the-app",
          title: "Cài đặt ứng dụng",
          summary:
            "Cài GeoCliks trên iPhone, iPad hoặc Android, và dùng bản web trên máy tính.",
          keywords: [
            "tải về",
            "cài đặt",
            "máy tính",
            "download",
            "ios",
            "android",
            "install",
            "desktop",
          ],
          body: [
            p(
              "Việc chụp diễn ra trên điện thoại hoặc máy tính bảng. Xem lại, làm báo cáo và lên tuyến thì dễ hơn trên máy tính, nhưng mọi thứ đều có ở cả hai bên.",
            ),
            h("Trên di động"),
            ul(
              "iPhone và iPad: cài từ App Store.",
              "Android: cài từ Google Play.",
              "Hoặc mở geocliks.com/get-app ngay trên máy rồi bấm vào đường liên kết dành cho nền tảng của bạn.",
            ),
            h("Trên máy tính"),
            p(
              "Vào geocliks.com và đăng nhập. Không phải cài gì cả — không gian nhóm chạy thẳng trong trình duyệt. Cũng có sẵn ứng dụng máy tính nếu bạn thích một cửa sổ riêng.",
            ),
            h("Những quyền ứng dụng sẽ xin"),
            ul(
              "Máy ảnh — bắt buộc. Không có thì chẳng chụp được gì.",
              "Vị trí — bắt buộc. Toạ độ GPS là một nửa thứ làm nên giá trị bằng chứng của hình ảnh.",
              "Ảnh — tuỳ chọn, chỉ cần nếu bạn muốn lưu thêm hình ảnh vào cuộn ảnh của máy.",
              "Thông báo — tuỳ chọn, dùng cho việc tải lên, tin nhắn và phân công tuyến.",
            ),
            note(
              "Hãy đặt quyền vị trí ở mức tối thiểu là 'Khi đang dùng ứng dụng'. Nếu để 'Hỏi mỗi lần', ứng dụng buộc phải ngắt lời bạn trước từng lần chụp.",
            ),
            see("mobile-app/sign-in-on-mobile", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Chọn lối đi của bạn",
      articles: [
        {
          slug: "for-solo-user",
          title: "Nếu bạn làm việc một mình",
          summary: "Cách thiết lập nhanh nhất cho người làm một mình.",
          keywords: [
            "một mình",
            "cá nhân",
            "tự do",
            "solo",
            "single user",
            "freelancer",
            "one person",
          ],
          body: [
            p(
              "Bạn không cần có đội mới khai thác được GeoCliks. Một tài khoản cá nhân đã cho bạn hình ảnh có hình mờ, dự án để tách bạch từng việc, và bản xuất để đưa thẳng cho khách hàng.",
            ),
            h("Thiết lập trong năm phút"),
            steps(
              "Cài ứng dụng rồi đăng nhập.",
              "Tạo dự án đầu tiên — thường lấy tên theo địa chỉ công trình hoặc tên khách hàng.",
              "Mở mẫu hình mờ và thêm logo của bạn, để bản xuất mang dấu ấn riêng.",
              "Chụp thử một tấm và kiểm tra xem dấu có hiện đúng thời điểm và địa chỉ không.",
              "Xuất ra PDF để xem trước thứ khách hàng sẽ nhận được.",
            ),
            h("Nên làm gì khi công việc lớn dần"),
            ul(
              "Giữ mỗi việc một dự án. Cách đó giúp báo cáo gọn gàng và bản đồ dễ đọc.",
              "Dùng so sánh trước và sau ở đầu và cuối mỗi việc.",
              "Gửi khách hàng một liên kết chia sẻ thay vì tệp đính kèm trong email — liên kết luôn cập nhật.",
            ),
            note(
              "Gói Free bao gồm ảnh có hình mờ, video 30 giây trong ba ngày đầu, và xuất PDF tối đa 20 ảnh. Gói Plus nới các giới hạn ảnh và video cho một người.",
            ),
            see("teamspace/create-a-project", "plans-billing/compare-plans"),
          ],
        },
        {
          slug: "for-team-owner",
          title: "Nếu bạn là người điều hành đội",
          summary:
            "Tạo không gian làm việc, mời đội vào, và quyết định ai được làm gì.",
          keywords: [
            "chủ sở hữu",
            "quản trị",
            "thiết lập",
            "không gian làm việc",
            "owner",
            "admin",
            "setup",
            "workspace",
            "manager",
          ],
          body: [
            p(
              "Chủ sở hữu không gian làm việc thiết lập không gian nhóm một lần, rồi những người còn lại tham gia vào đó. Hãy làm việc này trên máy tính — nhanh hơn hẳn so với làm trên điện thoại.",
            ),
            h("Thứ tự thiết lập hiệu quả"),
            steps(
              "Tạo không gian làm việc và đặt theo tên công ty của bạn.",
              "Dựng một mẫu hình mờ có logo và những mục bạn muốn hiện trên mọi tấm ảnh.",
              "Tạo sẵn các dự án đang chạy trước khi mời ai vào, để đội có chỗ mà bỏ hình ảnh.",
              "Mời đội qua email, hoặc chia sẻ liên kết tham gia hay mã QR đã in ra.",
              "Đặt vai trò cho từng người. Phần lớn đội nên ở vai trò Field.",
              "Tự chụp một tấm và xác nhận nó rơi đúng vào dự án cần thiết.",
            ),
            h("Các vai trò"),
            ul(
              "Owner — toàn quyền, gồm cả thanh toán và xoá không gian làm việc. Chỉ có duy nhất một người.",
              "Admin — làm được mọi thứ như Owner, trừ thanh toán và quyền sở hữu.",
              "Manager — tạo dự án và tuyến đường, mời người, chạy báo cáo.",
              "Field — chụp ảnh và video, chạy tuyến được giao, xem phần việc của chính mình.",
            ),
            note(
              "Hãy mời mọi người vào vai trò Field trừ khi họ cần tạo dự án hoặc chạy báo cáo. Bạn có thể nâng vai trò bất cứ lúc nào; thay đổi có hiệu lực trong lần mở ứng dụng kế tiếp của họ. Tên các vai trò được giữ nguyên tiếng Anh trong ứng dụng, đúng như bạn thấy ở đây.",
            ),
            see("teamspace/invite-your-crew", "teamspace/roles-and-permissions"),
          ],
        },
        {
          slug: "for-crew-member",
          title: "Nếu bạn được mời vào một đội",
          summary: "Tham gia không gian làm việc và chụp tấm hình đầu tiên.",
          keywords: [
            "hiện trường",
            "đội",
            "tham gia",
            "được mời",
            "thành viên",
            "field",
            "crew",
            "join",
            "invited",
            "member",
          ],
          body: [
            p(
              "Ai đó ở công ty bạn đã lập một không gian làm việc và thêm bạn vào. Việc của bạn là ghi lại công việc ngoài hiện trường; phần dự án, báo cáo và thanh toán để văn phòng lo.",
            ),
            h("Tham gia"),
            steps(
              "Mở email mời, hoặc quét mã QR mà quản lý của bạn đưa.",
              "Tạo tài khoản, hoặc đăng nhập nếu bạn đã có sẵn.",
              "Cài ứng dụng GeoCliks lên điện thoại.",
              "Cho phép truy cập máy ảnh và vị trí. Cả hai đều bắt buộc mới chụp được.",
              "Mở danh sách dự án và chọn đúng việc bạn đang làm.",
            ),
            h("Tấm hình đầu tiên của bạn"),
            steps(
              "Bấm nút chụp.",
              "Xem bản xem trước hình mờ có hiện đúng dự án và địa chỉ không.",
              "Chụp ảnh. Ảnh sẽ tự tải lên.",
              "Nếu không có sóng, cứ làm tiếp — hình ảnh xếp hàng chờ và tải lên sau.",
            ),
            note(
              "Bạn không sửa được thời điểm hay vị trí trên một hình ảnh, và quản lý của bạn cũng vậy. Đó chính là điểm mấu chốt của sản phẩm, không phải một hạn chế.",
            ),
            see("mobile-app/take-a-photo", "mobile-app/offline-capture-and-queue"),
          ],
        },
      ],
    },
  ],
};
