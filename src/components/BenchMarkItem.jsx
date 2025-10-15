import styled from "styled-components";

/* ===== 강조용 span ===== */
const BenchmarkItemHighlight = styled.span`
  color: #ff00d4;
`;

const BenchmarkValueHighlight = styled.span`
  color: #00aa6f;
`;

const BenchmarkValue = styled.span`
  color: #ffffff;
`;

/* ===== industry-benchmark-item ===== */
const BenchmarkItem = styled.div`
  font-size: 22px;
  color: #ffffff;
  margin-top: 8px;
  display: flex;
  justify-content: space-around;
  font-weight: 800;

  &:nth-child(1) {
    gap: 150px;
  }

  &:nth-child(2) {
    gap: 190px;
  }

  &:nth-child(3) {
    gap: 190px;
  }
`;

function BenchMarkItem({ topic, value }) {
  return (
    <>
      {topic === "우리 빌딩" ? (
        <BenchmarkItem>
          <BenchmarkItemHighlight>{topic}</BenchmarkItemHighlight>{" "}
          <BenchmarkValueHighlight>{value}</BenchmarkValueHighlight>
        </BenchmarkItem>
      ) : (
        <BenchmarkItem>
          {topic} <BenchmarkValue>{value}</BenchmarkValue>
        </BenchmarkItem>
      )}
    </>
  );
}

export default BenchMarkItem;
