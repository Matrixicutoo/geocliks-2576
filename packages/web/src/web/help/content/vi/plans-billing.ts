import { type Category, h, note, p, see, steps, table, ul, warn } from "../../types";

export const plansBilling: Category = {
  slug: "plans-billing",
  title: "Gói và thanh toán",
  summary: "Mỗi gói bao gồm những gì, cách đổi gói, và cách tìm hóa đơn.",
  icon: "CreditCard",
  sections: [
    {
      title: "Chọn gói",
      articles: [
        {
          slug: "compare-plans",
          title: "So sánh các gói",
          summary: "Bạn nhận được gì ở Free, Plus, Business, Crew 10, Crew 25 và Enterprise.",
          keywords: [
            "gói",
            "bảng giá",
            "so sánh",
            "miễn phí",
            "giới hạn",
            "plans",
            "pricing",
            "compare",
            "free",
            "plus",
            "business",
            "crew",
            "limits",
          ],
          body: [
            p(
              "Có hai nhóm gói. Các gói bằng chứng dưới đây dùng để ghi lại công việc. Các gói Giao hàng dành cho hoạt động chủ yếu là lái xe, và được nói riêng trong bài viết của chúng.",
            ),
            p(
              "Giá hiện tại nằm ở phần bảng giá trên geocliks.com. Trang này nói về những gì mỗi gói thực sự cho phép, và đó mới là phần khiến nhiều người bị hụt.",
            ),
            h("Các gói bằng chứng"),
            table(
              ["Gói", "Dành cho", "Chỗ ngồi"],
              [
                ["Free", "Dùng thử, hoặc ghi hình cá nhân thỉnh thoảng.", "1"],
                ["Plus", "Một người làm toàn thời gian, chia sẻ với khách hàng.", "1"],
                ["Business", "Một đội nhỏ dùng chung không gian nhóm.", "5"],
                ["Crew 10", "Một đội đang lớn dần.", "10"],
                ["Crew 25", "Một hoạt động quy mô lớn hơn.", "25"],
                ["Enterprise", "Khối lượng và điều khoản tùy chỉnh. Hãy trao đổi với chúng tôi.", "Tùy chỉnh"],
              ],
            ),
            h("Điều gì thay đổi khi bạn lên gói cao hơn"),
            table(
              ["Khả năng", "Bắt đầu từ đâu"],
              [
                ["Chụp có xác thực, hình mờ, mã ảnh", "Free"],
                ["Chụp không giới hạn mỗi tháng", "Plus"],
                ["Xuất Excel, ZIP và KMZ", "Plus"],
                ["Liên kết chia sẻ", "Plus"],
                ["Dự án và mẫu hình mờ không giới hạn", "Plus"],
                ["Logo của bạn trên hình mờ", "Plus"],
                ["Video dài không bị cắt", "Plus"],
                ["Không gian nhóm với thành viên được mời", "Business"],
                ["Vai trò và quyền truy cập theo từng dự án", "Business"],
              ],
            ),
            h("Chi tiết gói Free"),
            ul(
              "300 lần chụp mỗi tháng.",
              "Video bị giới hạn ở các đoạn 30 giây, và chỉ trong ba ngày đầu.",
              "Ba dự án, một chỗ ngồi, hai mẫu hình mờ.",
              "Xuất PDF tối đa 20 ảnh. Không có Excel, ZIP hay KMZ.",
              "Không có không gian nhóm, nên không có thành viên được mời và không có liên kết chia sẻ.",
              "Không có tuyến đường giao hàng.",
            ),
            note(
              "Mọi gói, kể cả Free, đều cho bạn cùng một mức xác thực: cùng dữ liệu hình mờ, cùng mã ảnh, cùng niêm phong. Xác thực không phải là tính năng phải trả thêm tiền.",
            ),
            h("Giao hàng trên các gói bằng chứng"),
            p(
              "Plus trở lên bao gồm hạn mức điểm dừng hằng tháng, nên bạn có thể chạy tuyến mà không cần chuyển sang gói Giao hàng: hạn mức khiêm tốn ở Plus, nhiều hơn ở Business, và tăng dần ở Crew 10 và Crew 25. Nếu bạn lái xe mỗi ngày, các gói Giao hàng rẻ hơn tính trên mỗi điểm dừng.",
            ),
            see("plans-billing/delivery-plans", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "delivery-plans",
          title: "Các gói Giao hàng",
          summary:
            "Delivery Lite, Pro, Fleet, Fleet 30, Fleet 200 và Fleet 500 — phân theo số điểm dừng mỗi tháng và số tài xế.",
          keywords: [
            "giao hàng",
            "điểm dừng",
            "tài xế",
            "điều phối",
            "delivery",
            "lite",
            "pro",
            "fleet",
            "stops",
            "drivers",
            "dispatch",
          ],
          body: [
            p(
              "Các gói Giao hàng dành cho hoạt động mà lái xe chính là công việc kinh doanh chứ không phải hệ quả phụ của nó. Chúng bao gồm mọi thứ trong các gói bằng chứng cộng với hạn mức điểm dừng hằng tháng lớn hơn nhiều.",
            ),
            table(
              ["Gói", "Điểm dừng mỗi tháng", "Tài xế", "Điều phối trực tiếp", "Tối ưu thông minh"],
              [
                ["Delivery Lite", "500", "2", "Không", "Không"],
                ["Delivery Pro", "2.000", "5", "Có", "Có"],
                ["Delivery Fleet", "6.000", "15", "Có", "Có"],
                ["Delivery Fleet 30", "12.000", "30", "Có", "Có"],
                ["Delivery Fleet 200", "80.000", "200", "Có", "Có"],
                ["Delivery Fleet 500", "200.000", "500", "Có", "Có"],
              ],
            ),
            h("Hai tính năng bị giới hạn theo gói là gì"),
            ul(
              "Điều phối trực tiếp — thêm điểm dừng vào một tuyến đường đang được chạy. Có ở Pro, Fleet, Fleet 30, Fleet 200 và Fleet 500.",
              "Tối ưu thông minh — sắp xếp thứ tự tuyến theo mạng lưới đường thật thay vì bộ giải tiêu chuẩn. Có ở Pro, Fleet, Fleet 30, Fleet 200 và Fleet 500. Ở các gói không có, bộ tối ưu tiêu chuẩn sẽ chạy thay thế nên bạn vẫn có một tuyến đã được sắp thứ tự.",
            ),
            h("Cách đăng ký"),
            p(
              "Mọi gói Giao hàng đều tự đăng ký được từ trang thanh toán: chọn gói, đi qua trang thanh toán an toàn, nhập thông tin thẻ. Giới hạn mới áp dụng ngay khi hoàn tất. Gói Giao hàng bắt đầu bằng bản dùng thử miễn phí, nên nút của nó ghi Dùng thử miễn phí. Nếu không gian làm việc của bạn đã ở một gói Giao hàng, chuyển sang gói khác sẽ tính tiền ngay và nút ghi Chuyển sang — bản dùng thử chỉ có một lần cho mỗi không gian làm việc, không phải một lần cho mỗi gói.",
            ),
            steps(
              "Mở Thanh toán trong cài đặt không gian làm việc.",
              "Chọn gói Giao hàng phù hợp với khối lượng của bạn.",
              "Hoàn tất thanh toán. Bạn được đưa về GeoCliks với hạn mức điểm dừng đã kích hoạt sẵn.",
            ),
            warn(
              "Enterprise là gói duy nhất không tự đăng ký được. Thẻ của nó hiện Hãy trao đổi với chúng tôi thay vì nút thanh toán, và mở sẵn một email gửi tới sales@geocliks.com. Không ai bị tính tiền tự động và không có gì thay đổi trên không gian làm việc của bạn cho tới khi chúng tôi thiết lập cùng bạn.",
            ),
            note(
              "Chỉ chủ sở hữu không gian làm việc mới đổi được gói. Admin quản lý con người, không quản lý gói đăng ký.",
            ),
            h("Gói nào phù hợp"),
            p(
              "Hãy đếm số điểm dừng bạn thực sự giao trong một tháng bình thường, rồi cộng thêm một khoảng dư cho tuần bận nhất. Vượt hạn mức sẽ khiến việc lập tuyến dừng lại cho tới tháng sau, nên gói nên phủ được đỉnh điểm của bạn, chứ không phải mức trung bình.",
            ),
            note(
              "Điểm dừng được đếm theo tháng dương lịch và đặt lại vào ngày đầu tháng. Một điểm dừng được tính khi nó được thêm vào tuyến đường, bất kể cuối cùng có giao được hay không.",
            ),
            see("delivery-routes/delivery-overview", "plans-billing/compare-plans"),
          ],
        },
      ],
    },
    {
      title: "Quản lý gói đăng ký",
      articles: [
        {
          slug: "upgrade-or-change-plan",
          title: "Nâng cấp hoặc đổi gói",
          summary: "Đổi gói từ trang thanh toán — chủ sở hữu là người làm việc này.",
          keywords: [
            "nâng cấp",
            "đổi gói",
            "thanh toán",
            "hạ gói",
            "chuyển gói",
            "upgrade",
            "change plan",
            "checkout",
            "downgrade",
            "switch",
          ],
          body: [
            p(
              "Gói được đổi từ mục Thanh toán trong cài đặt không gian làm việc. Chỉ chủ sở hữu không gian làm việc làm được — admin quản lý con người, không quản lý gói đăng ký.",
            ),
            h("Đổi gói"),
            steps(
              "Mở Thanh toán.",
              "Chọn gói bạn muốn.",
              "Với gói trả phí tự đăng ký được, bạn được đưa tới trang thanh toán an toàn để nhập thông tin thẻ, rồi quay lại GeoCliks khi hoàn tất.",
              "Với Enterprise, bạn nhận được một email soạn sẵn gửi tới đội ngũ của chúng tôi.",
              "Giới hạn mới áp dụng ngay khi thay đổi có hiệu lực.",
            ),
            h("Chuyển lên gói lớn hơn"),
            ul(
              "Giới hạn mới có hiệu lực ngay lập tức.",
              "Những gì bạn đã chụp không bị ảnh hưởng.",
              "Chỗ ngồi bổ sung có ngay, nên bạn có thể mời người khác liền sau đó.",
            ),
            h("Chuyển xuống gói thấp hơn"),
            p(
              "Việc hạ gói bị từ chối khi không gian làm việc của bạn lớn hơn gói đích. Nếu bạn có tám thành viên và chuyển sang gói năm chỗ ngồi, bạn sẽ được yêu cầu xóa bớt thành viên trước. Đó là cố ý — cách còn lại là âm thầm cắt quyền của ba người.",
            ),
            note(
              "Chọn gói Free, hoặc chọn lại chính gói bạn đang dùng, sẽ không đi qua bước thanh toán nào cả.",
            ),
            see("plans-billing/seats-and-billing", "plans-billing/cancel-or-downgrade"),
          ],
        },
        {
          slug: "seats-and-billing",
          title: "Chỗ ngồi",
          summary: "Chỗ ngồi là gì, cái gì chiếm một chỗ, và làm gì khi hết chỗ.",
          keywords: [
            "chỗ ngồi",
            "thành viên",
            "mời",
            "giới hạn",
            "sức chứa",
            "người dùng",
            "seats",
            "members",
            "invite",
            "limit",
            "capacity",
            "users",
          ],
          body: [
            p(
              "Một chỗ ngồi là một người có thể đăng nhập vào không gian làm việc của bạn. Gói của bạn bao gồm một số lượng cố định, và chủ sở hữu tính là một trong số đó.",
            ),
            h("Cái gì chiếm một chỗ ngồi"),
            ul(
              "Mọi thành viên của không gian làm việc, bất kể vai trò. Một thành viên Field tốn đúng một chỗ ngồi như một Admin.",
              "Mọi lời mời đang chờ, cho tới khi được chấp nhận hoặc bị thu hồi.",
            ),
            p(
              "Lời mời đang chờ giữ một chỗ ngồi là có chủ ý. Nếu không, mười lời mời có thể được phát ra dựa trên hai chỗ ngồi và tất cả những ai chấp nhận đều sẽ vượt quá gói.",
            ),
            h("Hết chỗ ngồi"),
            steps(
              "Mở Nhóm và xem các lời mời đang chờ. Thu hồi những lời mời sẽ không được chấp nhận.",
              "Xóa những thành viên đã rời đi. Ảnh chụp và lịch sử của họ vẫn ở lại trong không gian làm việc.",
              "Nếu bạn thực sự cần thêm người, hãy lên gói cao hơn.",
            ),
            note(
              "Xóa một thành viên sẽ giải phóng chỗ ngồi của họ ngay lập tức và không bao giờ xóa công việc của họ.",
            ),
            see("teamspace/invite-your-crew", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "payment-and-invoices",
          title: "Thanh toán và hóa đơn",
          summary: "Thông tin thẻ nằm ở đâu, cách cập nhật, và lấy biên nhận ở đâu.",
          keywords: [
            "hóa đơn",
            "biên nhận",
            "thẻ",
            "thanh toán",
            "thuế",
            "cổng thanh toán",
            "invoice",
            "receipt",
            "card",
            "payment",
            "vat",
            "tax",
            "billing portal",
          ],
          body: [
            p(
              "Các khoản thanh toán do đơn vị xử lý thanh toán của chúng tôi lo, không phải GeoCliks. Số thẻ của bạn không bao giờ được lưu trên máy chủ của chúng tôi.",
            ),
            h("Cập nhật thẻ"),
            steps(
              "Mở Thanh toán trong cài đặt không gian làm việc.",
              "Mở cổng thanh toán.",
              "Cập nhật phương thức thanh toán ở đó.",
            ),
            h("Hóa đơn và biên nhận"),
            ul(
              "Mỗi lần thanh toán đều tạo ra một hóa đơn, xem được trong cổng thanh toán.",
              "Hóa đơn được gửi tới địa chỉ thanh toán trên gói đăng ký, mà địa chỉ đó không phải lúc nào cũng là email đăng nhập của chủ sở hữu — hãy kiểm tra nếu biên nhận đang tới nhầm người.",
              "Thêm tên công ty và thông tin thuế của bạn trong cổng thanh toán và chúng sẽ xuất hiện trên các hóa đơn sau.",
            ),
            h("Một lần thanh toán thất bại"),
            p(
              "Đơn vị xử lý thanh toán sẽ thử lại một lần thanh toán thất bại trước khi có bất kỳ thay đổi nào trên không gian làm việc của bạn. Nếu vẫn tiếp tục thất bại, không gian làm việc của bạn rơi xuống giới hạn của gói Free — ảnh chụp của bạn không bị xóa, nhưng xuất dữ liệu, liên kết chia sẻ và không gian nhóm ngừng hoạt động cho tới khi thanh toán thành công.",
            ),
            warn(
              "Nếu không gian làm việc của bạn đang ở một gói do chúng tôi thiết lập thủ công, có thể sẽ không có cổng tự phục vụ. Hãy gửi email tới support@geocliks.com và chúng tôi sẽ xử lý hóa đơn giúp bạn.",
            ),
            see("plans-billing/cancel-or-downgrade", "plans-billing/upgrade-or-change-plan"),
          ],
        },
        {
          slug: "cancel-or-downgrade",
          title: "Hủy hoặc hạ gói",
          summary: "Cách ngừng thanh toán, và chính xác điều gì xảy ra với bằng chứng của bạn.",
          keywords: [
            "hủy",
            "hạ gói",
            "xóa",
            "hoàn tiền",
            "xuất dữ liệu",
            "rời đi",
            "dữ liệu",
            "cancel",
            "downgrade",
            "delete",
            "refund",
            "export",
            "leave",
            "data",
          ],
          body: [
            p(
              "Bạn có thể ngừng thanh toán bất cứ lúc nào. Câu hỏi quan trọng là điều gì xảy ra với công việc, nên đây là câu trả lời thẳng thắn.",
            ),
            h("Hủy"),
            steps(
              "Hãy xuất mọi thứ bạn sẽ cần dùng bên ngoài GeoCliks trước. Làm việc này trước khi hủy, vì các định dạng xuất bị giới hạn trên gói Free.",
              "Thu gọn không gian làm việc cho vừa với gói bạn sẽ chuyển sang, nếu bạn hạ xuống gói ít chỗ ngồi hơn.",
              "Mở Thanh toán rồi chuyển sang gói Free hoặc hủy trong cổng thanh toán.",
            ),
            h("Điều gì xảy ra với dữ liệu của bạn"),
            ul(
              "Ảnh chụp của bạn không bị xóa khi bạn hạ gói hoặc hủy.",
              "Xác thực vẫn hoạt động. Mã ảnh vẫn tra cứu được, và niêm phong vẫn kiểm tra được.",
              "Các tính năng trả phí ngừng lại: xuất Excel, ZIP và KMZ, liên kết chia sẻ, không gian nhóm và tuyến đường giao hàng.",
              "Các liên kết chia sẻ hiện có ngừng hoạt động trong thời gian gói của bạn không bao gồm chúng.",
              "Thành viên vượt quá số chỗ ngồi mới sẽ mất quyền truy cập, và đó là lý do việc hạ gói yêu cầu bạn xóa họ trước.",
            ),
            warn(
              "Hãy xuất dữ liệu trước khi hủy, không phải sau. Trên gói Free bạn chỉ được xuất PDF tối đa 20 ảnh, và đó không phải là cách để lấy cả một năm công việc ra.",
            ),
            h("Xóa hẳn không gian làm việc"),
            p(
              "Hủy gói không phải là xóa. Nếu bạn muốn xóa vĩnh viễn không gian làm việc cùng nội dung của nó, hãy gửi email tới support@geocliks.com từ địa chỉ của chủ sở hữu và yêu cầu xóa. Việc này không thể hoàn tác và chúng tôi sẽ xác nhận trước khi thực hiện.",
            ),
            see("legal/data-retention", "teamspace/reports-and-exports"),
          ],
        },
      ],
    },
  ],
};
