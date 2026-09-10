import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const deliveryRoutes: Category = {
  slug: "delivery-routes",
  title: "Tuyến đường giao hàng",
  summary:
    "Lên kế hoạch một ngày làm việc của tài xế, cho xe chạy, và đóng mọi điểm dừng bằng một tấm ảnh bằng chứng mà người nhận xem được.",
  icon: "Route",
  sections: [
    {
      title: "Lên kế hoạch cho ngày làm việc",
      articles: [
        {
          slug: "delivery-overview",
          title: "Giao hàng hoạt động thế nào",
          summary:
            "Hình dung một ngày giao hàng trong GeoCliks: dựng tuyến đường, giao cho tài xế, đóng từng điểm dừng bằng bằng chứng.",
          keywords: [
            "giao hàng",
            "tuyến đường",
            "điều phối",
            "tài xế",
            "bằng chứng giao hàng",
            "delivery",
            "routes",
            "dispatch",
            "driver",
            "proof of delivery",
            "pod",
          ],
          body: [
            p(
              "Tuyến đường giao hàng lấy đúng ý tưởng ảnh đã xác thực và áp dụng vào một ngày làm việc của tài xế. Bạn dựng danh sách điểm dừng ở văn phòng, giao cho tài xế, và tài xế đóng từng điểm dừng bằng cách chụp ảnh lúc giao. Tấm ảnh mang theo thời gian đã xác thực, vị trí GPS và địa chỉ, nên một vụ tranh cãi về giao hàng sẽ có câu trả lời.",
            ),
            h("Một ngày làm việc, từ đầu đến cuối"),
            steps(
              "Văn phòng tạo một tuyến đường cho một ngày và dán vào danh sách địa chỉ của ngày hôm đó.",
              "GeoCliks định vị các địa chỉ lên bản đồ, và bạn sửa những địa chỉ nó không đặt được.",
              "Bạn sắp thứ tự các điểm dừng, bằng tay hoặc bằng bộ tối ưu.",
              "Bạn giao tuyến đường cho một tài xế, người đó sẽ thấy nó trên điện thoại.",
              "Tài xế chạy hết danh sách, chụp ảnh từng lần giao.",
              "Người nhận có địa chỉ email sẽ nhận được thư bằng chứng giao hàng kèm ảnh.",
              "Văn phòng theo dõi tuyến đường đóng dần theo thời gian thực và giữ lại toàn bộ dấu vết kiểm toán.",
            ),
            h("Hai loại tuyến đường"),
            table(
              ["Chế độ", "Dùng khi"],
              [
                [
                  "Planned",
                  "Bạn đã biết trước cả ngày làm việc. Dựng tuyến, tối ưu, rồi cho chạy.",
                ],
                [
                  "Dispatch",
                  "Đơn hàng đến giữa ca và được chèn vào những điểm dừng còn lại của tài xế.",
                ],
              ],
            ),
            h("Mỗi điểm dừng kết thúc ở một trong bốn trạng thái"),
            ul(
              "Đã giao — đóng lại kèm ảnh bằng chứng.",
              "Thất bại — tài xế không giao được, kèm lý do và một tấm ảnh.",
              "Bỏ qua — ở đây không có gì để giao. Đây là kiểu đóng duy nhất không cần ảnh.",
              "Chờ xử lý — chưa tới nơi.",
            ),
            note(
              "Giao hàng là một năng lực tách biệt với việc chụp bằng chứng. Hạn mức điểm dừng giao hàng mỗi tháng đến từ gói của bạn, và các gói Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 và Fleet 500 tồn tại cho những đơn vị mà công việc chủ yếu là chạy xe.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "create-a-route",
          title: "Tạo một tuyến đường",
          summary:
            "Đặt ngày, kho xuất phát, giờ khởi hành và thời gian trung bình cho mỗi điểm dừng.",
          keywords: [
            "tuyến đường mới",
            "tạo",
            "kho",
            "giờ khởi hành",
            "thời gian phục vụ",
            "chữ ký",
            "new route",
            "create",
            "depot",
            "start time",
            "service time",
            "signature",
          ],
          body: [
            p(
              "Một tuyến đường là công việc của một tài xế trong một ngày. Hãy tạo nó trước, rồi mới đổ điểm dừng vào.",
            ),
            h("Tạo tuyến đường"),
            steps(
              "Mở Tuyến đường và chọn Tuyến đường mới.",
              "Đặt cho nó một cái tên mà người điều phối nhận ra ngay trong một buổi sáng bận rộn — \"Thứ ba khu bắc\" hơn hẳn \"Tuyến 4\".",
              "Đặt ngày.",
              "Chọn chế độ Planned hoặc Dispatch.",
              "Nếu muốn, liên kết nó với một dự án, để ảnh giao hàng nằm chung với bằng chứng của công việc đó.",
              "Nhập địa chỉ xuất phát — thường là kho hoặc bãi xe của bạn.",
              "Lưu lại.",
            ),
            h("Những thiết lập định hình kế hoạch"),
            table(
              ["Thiết lập", "Tác dụng"],
              [
                [
                  "Địa chỉ xuất phát",
                  "Nơi ngày làm việc bắt đầu. Bộ tối ưu lên kế hoạch tỏa ra từ đây.",
                ],
                ["Quay về điểm xuất phát", "Tính cả quãng đường chạy về kho vào kế hoạch."],
                ["Giờ khởi hành", "Lúc tài xế lăn bánh. Mặc định là 08:00."],
                [
                  "Thời gian phục vụ",
                  "Số phút ở lại một điểm dừng trung bình. Mặc định là 5. Đây là cơ sở để ước tính giờ đến.",
                ],
                ["Yêu cầu chữ ký", "Yêu cầu tài xế lấy chữ ký bên cạnh tấm ảnh."],
              ],
            ),
            h("Thời gian phục vụ đáng để đặt cho đúng"),
            p(
              "Thời gian phục vụ là cách tính giờ đến dự kiến cho mọi điểm dừng phía sau. Năm phút hợp với bưu kiện đặt trước cửa. Một điểm dừng phải dỡ pallet thì gần hai mươi phút hơn, và bạn có thể ghi đè thời gian phục vụ trên từng điểm dừng mà bạn biết là chậm.",
            ),
            note(
              "Tạo tuyến đường cần vai trò Manager trở lên. Tài xế không tự dựng tuyến đường của mình.",
            ),
            warn(
              "Chế độ Dispatch cần Delivery Pro trở lên. Nếu gói của bạn chỉ có tuyến đường Planned, bạn sẽ được báo ngay lúc chọn chế độ chứ không phải sau khi đã dựng xong cả ngày làm việc.",
            ),
            see("delivery-routes/add-stops-by-pasting-a-list", "delivery-routes/live-dispatch"),
          ],
        },
        {
          slug: "add-stops-by-pasting-a-list",
          title: "Thêm điểm dừng bằng cách dán danh sách hoặc tải lên CSV",
          summary:
            "Dán một cột bảng tính, một email của khách, hoặc tải lên tệp CSV — GeoCliks đều đọc được các cột.",
          keywords: [
            "điểm dừng",
            "dán",
            "nhập",
            "tải lên",
            "tệp",
            "bảng tính",
            "hàng loạt",
            "địa chỉ",
            "stops",
            "paste",
            "import",
            "upload",
            "file",
            "spreadsheet",
            "csv",
            "bulk",
            "addresses",
          ],
          body: [
            p(
              "Điểm dừng vào hệ thống theo hai đường: dán địa chỉ vào, hoặc tải lên một tệp CSV. Cả hai đều rơi vào cùng một ô và đi qua cùng một bộ đọc, nên mọi thứ bên dưới đúng cho cả hai. Bạn không cần định dạng lại danh sách trước.",
            ),
            h("Dán một danh sách"),
            steps(
              "Mở tuyến đường và tìm ô Thêm điểm dừng.",
              "Dán cả khối vào. Mỗi dòng một điểm dừng.",
              "Đọc phần tóm tắt phía trên ô: tìm được bao nhiêu điểm dừng, dùng dấu phân tách nào, nhận ra những cột nào, và bỏ qua bao nhiêu dòng.",
              "Sửa những chỗ trông sai ngay trong nguồn rồi dán lại, hoặc cứ thêm điểm dừng vào và sửa từng cái sau.",
              "Chọn Thêm điểm dừng.",
            ),
            h("Tải lên một tệp CSV"),
            steps(
              "Xuất danh sách từ bảng tính hoặc hệ thống đơn hàng của bạn ra dạng CSV.",
              "Mở tuyến đường và tìm ô Thêm điểm dừng.",
              "Chọn Tải lên CSV và chọn tệp.",
              "Nội dung tệp rơi vào ô, ở đó bạn đọc được phần tóm tắt và sửa từng dòng trước khi có bất cứ thứ gì được tạo ra.",
              "Chọn Thêm điểm dừng.",
            ),
            note(
              "Tải lên không tự tạo ra điểm dừng — nó chỉ đổ đầy cái ô. Không có gì được thêm vào tuyến đường cho tới khi bạn chọn Thêm điểm dừng, nên chọn nhầm tệp cũng không mất gì. Tệp phải là CSV hoặc văn bản thuần và dưới 1 MB.",
            ),
            h("Bộ đọc hiểu được những gì"),
            ul(
              "Phân tách bằng tab, dấu phẩy hoặc dấu chấm phẩy. Nó tự nhận ra bạn dùng loại nào.",
              "Trường đặt trong dấu ngoặc kép, nên một địa chỉ có dấu phẩy bên trong ngoặc vẫn là một địa chỉ.",
              "Dòng tiêu đề, nếu có. Khi đó các cột được khớp theo tên, thứ tự tùy ý.",
              "Tên cột tiếng Việt, Anh, Pháp, Bồ Đào Nha, Đức, Ý, Ba Lan hoặc Trung — địa chỉ／người nhận／email／điện thoại／mã đơn hàng／ghi chú, address／name／phone／reference／notes. Dấu tiếng Việt có thể bỏ, nên dia chi, nguoi nhan và ghi chu đều nhận ra được.",
              "Địa chỉ bị tách ra nhiều cột bảng tính — đường, phường, quận, thành phố, mã bưu điện — được ghép lại thành một dòng.",
              "Địa chỉ email và số điện thoại được nhận ra nhờ hình dạng của chúng, kể cả khi không có dòng tiêu đề nào.",
            ),
            h("Các trường của từng điểm dừng"),
            table(
              ["Trường", "Vì sao nó quan trọng"],
              [
                ["Địa chỉ", "Bắt buộc. Mọi thứ còn lại đều tùy chọn."],
                ["Tên người nhận", "Hiện cho tài xế và dùng trong email bằng chứng."],
                [
                  "Email người nhận",
                  "Không có nó thì người nhận đó không có email theo dõi hay bằng chứng nào cả.",
                ],
                ["Điện thoại người nhận", "Để tài xế gọi trước."],
                ["Mã đơn hàng", "Số đơn, số hóa đơn hoặc mã vận đơn của bạn. Tìm kiếm được."],
                ["Ghi chú", "Mã cổng, số chuông cửa, chỗ để hàng."],
                ["Khung giờ", "Giờ đến sớm nhất và muộn nhất chấp nhận được."],
                [
                  "Thời gian phục vụ",
                  "Ghi đè mặc định của tuyến đường cho một điểm dừng bạn biết là chậm.",
                ],
              ],
            ),
            h("Vì sao mã bưu điện không bao giờ bị coi là tên người"),
            p(
              "Một danh sách Canada dán vào dạng \"12 Main St, Moncton NB, E1A 4H2\" trước đây tạo ra một người nhận tên là E1A 4H2. Bộ đọc bây giờ nhận ra các từ chỉ đường phố, mã tỉnh bang và hình dạng mã bưu điện, và chỉ tách trường cuối cùng ra làm tên người khi nó thật sự trông giống một cái tên.",
            ),
            note(
              "Bạn thêm được tối đa 300 điểm dừng trong một lần dán. Nếu ngày làm việc lớn hơn, hãy dán thành nhiều đợt — chúng nối tiếp vào cùng một tuyến đường.",
            ),
            warn(
              "Mọi điểm dừng đều tính vào hạn mức giao hàng hằng tháng của bạn. Nếu một lần dán làm bạn vượt trần của gói thì cả lần dán đó bị từ chối, nên bạn không bao giờ rơi vào cảnh có nửa tuyến đường.",
            ),
            see("delivery-routes/geocoding-and-fixing-addresses", "plans-billing/delivery-plans"),
          ],
        },
        {
          slug: "geocoding-and-fixing-addresses",
          title: "Định vị địa chỉ và sửa những địa chỉ hỏng",
          summary:
            "Biến địa chỉ gõ tay thành vị trí trên bản đồ, và tự ghim tay khi không tìm ra được một địa chỉ.",
          keywords: [
            "định vị",
            "địa chỉ",
            "ghim",
            "tọa độ",
            "thất bại",
            "bản đồ",
            "geocode",
            "address",
            "pin",
            "coordinates",
            "failed",
            "resolve",
            "map",
          ],
          body: [
            p(
              "Một địa chỉ vừa dán vào chỉ là chữ. Trước khi sắp thứ tự hay tính giờ cho một tuyến đường, mỗi điểm dừng cần một vị trí trên bản đồ. Bước đó gọi là định vị, và bạn chạy nó từ tuyến đường.",
            ),
            h("Định vị các điểm dừng"),
            steps(
              "Mở tuyến đường.",
              "Chọn Định vị địa chỉ. Chỉ những điểm dừng chưa được định vị mới được xử lý.",
              "Đọc kết quả: bao nhiêu điểm đã đặt được và bao nhiêu điểm thất bại.",
              "Xử lý các điểm thất bại trước khi bạn tối ưu.",
            ),
            h("Mỗi điểm dừng có một trạng thái định vị"),
            table(
              ["Trạng thái", "Ý nghĩa"],
              [
                ["Chưa định vị", "Chưa tra cứu."],
                ["Đã định vị", "Đã đặt lên bản đồ, kèm một địa chỉ đã được làm sạch."],
                ["Không tìm thấy", "Không tra ra được. Cần bạn giúp."],
                [
                  "Ghim thủ công",
                  "Bạn tự thả ghim. Không bao giờ bị ghi đè khi định vị lại.",
                ],
              ],
            ),
            h("Sửa một điểm dừng thất bại"),
            ul(
              "Sửa địa chỉ rồi định vị lại — thiếu thành phố hoặc tỉnh là nguyên nhân thường gặp.",
              "Hoặc mở bản đồ và tự thả ghim vào đúng chỗ. Điểm dừng chuyển thành Ghim thủ công và được coi như đã đặt.",
              "Ghim thủ công là lời giải cho một khu dân cư mới, một thửa đất ở nông thôn hoặc một công trình chưa có địa chỉ hành chính.",
            ),
            h("Định vị lại"),
            p(
              "Định vị lại có ép buộc sẽ tra cứu lại mọi điểm dừng, kể cả những điểm đã ở trạng thái Đã định vị. Nó cố tình không đụng tới các ghim thủ công, vì một cái ghim đặt bằng tay là thông tin tốt hơn bất cứ thứ gì việc tra cứu trả về.",
            ),
            note(
              "Việc tra cứu địa chỉ thiên về Canada, nên một địa chỉ ngắn như \"12 Main St, Moncton\" vẫn định vị được mà bạn không phải viết rõ tên quốc gia.",
            ),
            warn(
              "Những điểm dừng không có vị trí thì bộ tối ưu không sắp thứ tự được. Chúng bị dồn xuống cuối tuyến đường chứ không bị bỏ đi, nên hãy kiểm tra phần đuôi danh sách trước khi cho tài xế lên đường.",
            ),
            see("delivery-routes/optimize-stop-order", "troubleshoot/gps-or-address-wrong"),
          ],
        },
      ],
    },
    {
      title: "Cho tuyến đường chạy",
      articles: [
        {
          slug: "optimize-stop-order",
          title: "Sắp thứ tự các điểm dừng",
          summary:
            "Sắp lại bằng tay, hoặc để bộ tối ưu tính ra thứ tự chạy xe giúp bạn.",
          keywords: [
            "tối ưu",
            "thứ tự",
            "trình tự",
            "sắp lại",
            "ngắn nhất",
            "lập kế hoạch tuyến đường",
            "optimize",
            "order",
            "sequence",
            "reorder",
            "shortest",
            "route planning",
          ],
          body: [
            p(
              "Các điểm dừng bắt đầu theo đúng thứ tự bạn thêm vào. Đó hiếm khi là thứ tự bạn muốn chạy.",
            ),
            h("Bằng tay"),
            p(
              "Kéo các điểm dừng vào thứ tự bạn muốn. Hữu ích khi tài xế thuộc khu vực hơn mọi thuật toán, hoặc khi một khách hàng bắt buộc phải là điểm đầu tiên.",
            ),
            h("Bằng bộ tối ưu"),
            steps(
              "Định vị địa chỉ trước — điểm dừng không có vị trí thì không sắp thứ tự được.",
              "Chọn Tối ưu.",
              "Xem lại kết quả: thứ tự mới, tổng quãng đường và thời gian chạy xe ước tính.",
              "Sau đó chỉnh tay nếu bạn muốn. Tối ưu chỉ là một gợi ý mà bạn có quyền bác bỏ.",
            ),
            h("Hai bộ tối ưu"),
            table(
              ["Bộ tối ưu", "Nó làm gì"],
              [
                [
                  "Standard",
                  "Chạy ngay trong GeoCliks, không dùng dịch vụ ngoài, không tính lượt. Sắp thứ tự tốt cho một ngày bình thường.",
                ],
                [
                  "Smart",
                  "Dùng dữ liệu mạng lưới đường thật để sắp chặt hơn trên những tuyến dày đặc hoặc khó. Delivery Pro trở lên.",
                ],
              ],
            ),
            note(
              "Nếu bạn gọi bộ tối ưu Smart trên một gói không có nó, GeoCliks chạy bộ Standard thay vì báo lỗi. Bạn vẫn có một tuyến đường đã sắp thứ tự — hãy xem lịch sử của tuyến đường để biết bộ nào đã chạy.",
            ),
            h("Bộ tối ưu tôn trọng những gì"),
            ul(
              "Địa chỉ xuất phát của bạn, và thiết lập quay về kho nếu đang bật.",
              "Thời gian phục vụ trên từng điểm dừng, hoặc mặc định của tuyến đường.",
              "Những điểm dừng không có vị trí, chúng giữ nguyên chỗ ở cuối danh sách.",
            ),
            see("delivery-routes/assign-a-driver", "troubleshoot/route-optimize-failed"),
          ],
        },
        {
          slug: "assign-a-driver",
          title: "Giao tuyến đường cho tài xế",
          summary:
            "Trao tuyến đường cho một người trong không gian làm việc của bạn và bắt đầu ngày làm việc.",
          keywords: [
            "giao việc",
            "tài xế",
            "bắt đầu",
            "trạng thái",
            "điều phối",
            "hủy giao",
            "assign",
            "driver",
            "start",
            "status",
            "dispatch",
            "unassign",
          ],
          body: [
            p(
              "Một tuyến đường phải thuộc về ai đó thì mới chạy được. Tài xế phải là thành viên trong không gian làm việc của bạn — vai trò Field là vai trò đúng cho đội chỉ chạy xe và chụp ảnh.",
            ),
            h("Giao tuyến đường"),
            steps(
              "Mở tuyến đường.",
              "Chọn Giao việc, rồi chọn tài xế.",
              "Tuyến đường hiện lên điện thoại của họ, nằm trong các tuyến đường của ngày hôm đó.",
              "Chọn Bắt đầu khi họ lăn bánh, hoặc để tài xế tự bắt đầu bằng cách đóng điểm dừng đầu tiên.",
            ),
            h("Trạng thái tuyến đường"),
            table(
              ["Trạng thái", "Ý nghĩa"],
              [
                ["Nháp", "Đang dựng. Chưa có tài xế."],
                ["Đã giao", "Một tài xế đã nhận, chưa bắt đầu."],
                ["Đang chạy", "Đang được chạy ngay lúc này."],
                ["Hoàn tất", "Mọi điểm dừng đều đã đóng."],
                ["Đã hủy", "Đã hủy bỏ. Không thể đóng thêm điểm dừng nào nữa."],
              ],
            ),
            h("Khi bạn đổi ý"),
            ul(
              "Hủy giao một tuyến đường để trả nó về Nháp và trao cho người khác.",
              "Một tài xế chụp ảnh lần giao đầu tiên mà không bấm Bắt đầu thì tuyến đường vẫn chuyển sang Đang chạy.",
              "Hủy một tuyến đường sẽ chặn mọi điểm dừng đóng tiếp vào nó, và giữ nguyên mọi thứ đã ghi lại.",
            ),
            note(
              "Gói của bạn quy định quy mô đội xe. Delivery Lite cho hai tài xế, Pro năm, Fleet mười lăm, Fleet 30 ba mươi, Fleet 200 hai trăm, Fleet 500 năm trăm.",
            ),
            see(
              "delivery-routes/driver-run-and-proof-of-delivery",
              "teamspace/roles-and-permissions",
            ),
          ],
        },
        {
          slug: "live-dispatch",
          title: "Điều phối trực tiếp",
          summary:
            "Chèn một đơn hàng đến giữa ca vào những điểm dừng còn lại của tài xế.",
          keywords: [
            "điều phối",
            "trực tiếp",
            "thêm điểm dừng",
            "giữa ca",
            "theo yêu cầu",
            "chèn",
            "dispatch",
            "live",
            "add stop",
            "mid-shift",
            "on demand",
            "insert",
          ],
          body: [
            p(
              "Chế độ Dispatch dành cho công việc chưa tồn tại lúc ngày làm việc bắt đầu: một cuộc gọi đến lúc 14:00 và phải có người đi. Bạn thêm điểm dừng vào một tuyến đường đang được chạy và GeoCliks chèn nó vào.",
            ),
            h("Thêm một điểm dừng trực tiếp"),
            steps(
              "Mở tuyến đường đang chạy.",
              "Chọn Thêm điểm dừng trực tiếp.",
              "Nhập địa chỉ và thông tin người nhận.",
              "Xác nhận. Điểm dừng được chèn vào phần tuyến đường mà tài xế chưa tới, và hiện lên điện thoại của họ.",
            ),
            h("Những thứ không bao giờ bị xê dịch"),
            ul(
              "Những điểm dừng đã giao, đã thất bại hoặc đã bỏ qua.",
              "Điểm dừng mà tài xế đang trên đường tới.",
            ),
            p(
              "Điểm dừng mới được chèn vào chỗ rẻ nhất trong phần danh sách còn lại. Đây cố tình không phải là tối ưu lại: một công cụ xáo tung kế hoạch dưới chân một tài xế đang chạy sẽ bị chính người dùng bỏ rơi, và tối ưu lại liên tục trong một buổi tối bận rộn còn tốn tiền của bạn ở mỗi lần tính lại.",
            ),
            note(
              "Việc chèn chạy ngay tại chỗ và miễn phí, dù bạn làm bao nhiêu lần trong một ca.",
            ),
            warn(
              "Điều phối trực tiếp cần Delivery Pro trở lên. Trên gói chỉ có tuyến đường Planned, bạn vẫn thêm được điểm dừng vào một tuyến đường trước khi nó bắt đầu.",
            ),
            see("delivery-routes/create-a-route", "plans-billing/delivery-plans"),
          ],
        },
      ],
    },
    {
      title: "Trên đường",
      articles: [
        {
          slug: "driver-run-and-proof-of-delivery",
          title: "Chuyến chạy của tài xế và bằng chứng giao hàng",
          summary:
            "Tài xế nhìn thấy gì, và một điểm dừng được đóng lại bằng bằng chứng ra sao.",
          keywords: [
            "tài xế",
            "chuyến chạy",
            "bằng chứng",
            "ảnh",
            "chữ ký",
            "đã giao",
            "ngoại tuyến",
            "driver",
            "run",
            "proof",
            "photo",
            "signature",
            "delivered",
            "offline",
          ],
          body: [
            p(
              "Trên điện thoại, tài xế chỉ có một màn hình: điểm dừng đang tới, địa chỉ, người nhận, các ghi chú, và còn lại bao nhiêu điểm dừng. Mọi thứ khác được dẹp sang một bên.",
            ),
            h("Đóng một điểm dừng"),
            steps(
              "Chạm vào điểm dừng.",
              "Chụp ảnh giao hàng — kiện hàng trước cửa, pallet trong bến, bất cứ thứ gì chứng minh hàng đã tới.",
              "Xác nhận hoặc sửa tên người nhận.",
              "Lấy chữ ký, nếu tuyến đường yêu cầu.",
              "Đánh dấu Đã giao. Điểm dừng tiếp theo hiện lên.",
            ),
            h("Tấm ảnh không phải là tùy chọn"),
            p(
              "Một điểm dừng đã giao hoặc thất bại đều phải được đóng bằng một tấm ảnh thật từ không gian làm việc của bạn. Không có cách nào đánh dấu một điểm dừng là đã giao mà không đính kèm gì — đó chính là toàn bộ lý do dùng GeoCliks để giao hàng thay vì một ứng dụng đánh dấu danh sách.",
            ),
            h("Ngoại tuyến"),
            ul(
              "Chuyến chạy hoạt động khi không có sóng. Ảnh và các lần đóng điểm dừng xếp hàng chờ ngay trên máy.",
              "Thời gian hoàn tất được ghi là lúc chụp ảnh, không phải lúc tải lên, nên một tuyến đường chạy qua vùng mất sóng vẫn đọc ra đúng.",
              "Nếu hàng chờ được đẩy đi hai lần, lần thứ hai bị nhận ra và bỏ qua chứ không đóng điểm dừng hai lần.",
            ),
            note(
              "Văn phòng thấy từng điểm dừng đóng lại ngay khi nó về, nên người điều phối theo dõi tuyến đường biết tài xế đang ở đâu mà không cần gọi điện.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "mobile-app/offline-capture-and-queue",
            ),
          ],
        },
        {
          slug: "failed-and-skipped-stops",
          title: "Điểm dừng thất bại và bị bỏ qua",
          summary:
            "Ghi lại vì sao một lần giao hàng không diễn ra, theo cách mà văn phòng xử lý được.",
          keywords: [
            "thất bại",
            "bỏ qua",
            "không có ai ở nhà",
            "từ chối nhận",
            "sai địa chỉ",
            "ngoại lệ",
            "failed",
            "skipped",
            "nobody home",
            "refused",
            "wrong address",
            "exception",
          ],
          body: [
            p(
              "Không phải điểm dừng nào cũng trót lọt. Một điểm dừng thất bại vẫn là một điểm dừng đã đóng kèm bằng chứng — nó là bằng cớ rằng tài xế đã tới đó và đã thấy những gì.",
            ),
            h("Đánh dấu một điểm dừng là thất bại"),
            steps(
              "Chạm vào điểm dừng và chụp ảnh đúng thứ tài xế đang nhìn thấy — cánh cửa đóng, con hẻm bị chặn, tòa nhà không đúng.",
              "Chọn Thất bại.",
              "Chọn một lý do.",
              "Thêm ghi chú nếu có điều gì văn phòng cần biết.",
              "Lưu lại.",
            ),
            h("Các lý do"),
            table(
              ["Lý do", "Dùng cho"],
              [
                ["Không có ai ở nhà", "Không có ai để nhận hàng."],
                ["Từ chối nhận", "Người nhận không chịu nhận hàng."],
                ["Sai địa chỉ", "Địa chỉ không khớp với người nhận."],
                ["Đã đóng cửa", "Một cơ sở kinh doanh đang đóng cửa."],
                [
                  "Không vào được",
                  "Không thể tiếp cận về mặt vật lý — cổng khóa, tuyết, công trình đang thi công.",
                ],
                ["Khác", "Mọi trường hợp còn lại. Hãy viết rõ vào ghi chú."],
              ],
            ),
            h("Bỏ qua thì khác"),
            p(
              "Bỏ qua là chuyện khác: đó là tài xế báo rằng ở đây hoàn toàn không có gì để giao. Đây là kiểu đóng duy nhất không cần ảnh, và nó được ghi lại đúng là một lần bỏ qua để văn phòng đọc ra đúng như vậy trong lịch sử, chứ không phải một thất bại chưa từng xảy ra.",
            ),
            warn(
              "Một điểm dừng thất bại không bao giờ kích hoạt email bằng chứng giao hàng cho người nhận. Những trường hợp đó do văn phòng xử lý bằng tay, vì một câu \"kiện hàng của bạn đã tới\" vui vẻ gửi cho một lần giao thất bại còn tệ hơn là không gửi gì.",
            ),
            note(
              "Mọi lần đóng, thất bại và bỏ qua đều được ghi vào lịch sử của tuyến đường kèm ai làm và làm lúc nào, và lịch sử đó không sửa được.",
            ),
            see(
              "delivery-routes/tracking-links-and-notifications",
              "delivery-routes/driver-run-and-proof-of-delivery",
            ),
          ],
        },
        {
          slug: "tracking-links-and-notifications",
          title: "Liên kết theo dõi và email cho người nhận",
          summary:
            "Ba email mà một người nhận có thể nhận được, và trang theo dõi hiển thị chính xác những gì.",
          keywords: [
            "theo dõi",
            "thông báo",
            "email",
            "người nhận",
            "giờ đến dự kiến",
            "liên kết",
            "riêng tư",
            "tracking",
            "notification",
            "recipient",
            "eta",
            "link",
            "privacy",
          ],
          body: [
            p(
              "Một người nhận có địa chỉ email trên điểm dừng của mình có thể được thông báo tự động. Bạn bật tắt việc này theo từng tuyến đường, và người nhận không có địa chỉ email thì đơn giản là không bao giờ bị liên hệ.",
            ),
            h("Ba email"),
            table(
              ["Email", "Gửi khi nào"],
              [
                ["Đang trên đường", "Tuyến đường đã bắt đầu và tài xế đã ra khỏi kho."],
                ["Sắp tới lượt bạn", "Tài xế còn cách một số lần giao đã đặt trước."],
                [
                  "Đã giao",
                  "Điểm dừng của họ đã đóng. Kèm theo ảnh bằng chứng và mã ảnh của nó.",
                ],
              ],
            ),
            h("Thiết lập"),
            ul(
              "Bật hoặc tắt email báo trước cho tuyến đường.",
              "Đặt còn cách bao nhiêu điểm dừng thì gửi — một thì báo quá gấp, năm thì cho một khoảng thời gian rộng.",
              "Bật hoặc tắt email bằng chứng giao hàng.",
            ),
            h("Trang theo dõi hiển thị những gì"),
            p(
              "Mỗi email dẫn tới một trang theo dõi cho đúng một điểm dừng, mở qua một liên kết không thể đoán ra. Người nhận thấy tên công ty của bạn, địa chỉ của chính họ, còn bao nhiêu lần giao trước lượt họ, và một khi điểm dừng đã đóng thì thấy ảnh bằng chứng kèm thời gian và vị trí đã xác thực.",
            ),
            h("Những gì trang đó cố tình không hiển thị"),
            ul(
              "Bất kỳ điểm dừng, địa chỉ hay người nhận nào khác trên tuyến đường.",
              "Tên, số điện thoại hay vị trí trực tiếp của tài xế.",
              "Tên tuyến đường, hay tổng số điểm dừng — thứ sẽ giúp đối thủ vẽ lại vòng chạy của bạn.",
            ),
            note(
              "Mỗi người nhận chỉ nhận mỗi loại email nhiều nhất một lần, và tiến độ của tài xế được kiểm tra lại ngay trước khi gửi, nên không ai nhận được \"sắp tới lượt bạn\" cho một điểm dừng vừa mới giao xong.",
            ),
            warn(
              "Email cho người nhận chỉ gửi đi khi không gian làm việc của bạn đã cấu hình gửi email. Nếu người nhận báo là không nhận được gì, đó là thứ đầu tiên cần kiểm tra.",
            ),
            see(
              "delivery-routes/failed-and-skipped-stops",
              "troubleshoot/notifications-not-arriving",
            ),
          ],
        },
      ],
    },
  ],
};
